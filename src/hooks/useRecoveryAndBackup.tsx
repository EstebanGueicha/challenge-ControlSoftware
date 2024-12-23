import React, { useEffect } from 'react'
import { useAppStore } from '../store/Appstore'
import { randomPassPhrase } from '../services/randomPassPhrase'
import { TPassphraseLocation } from '../services/ApiService'
import { gdriveBackup, gdriveRecover } from '../services/GoogleDrive'

export const useRecoveryAndBackup = () => {
  const [err, setErr] = React.useState<string | null>(null)
  const [backupCompleted, setBackupCompleted] = React.useState(false)
  const [recoverCompleted, setRecoverCompleted] = React.useState(false)
  const [isBackupInProgress, setIsBackupInProgress] = React.useState(false)
  const [isRecoverInProgress, setIsRecoverInProgress] = React.useState(false)
  const {
    getGoogleDriveCredentials,
    backupKeys,
    recoverKeys,
    getPassphraseInfos,
    getLatestBackup,
    createPassphraseInfo,
    latestBackup,
    passphrases,
    walletId,
    initAppStore,
    initFireblocksNCW,
    setAppMode,
    assignCurrentDevice,
  } = useAppStore()

  useEffect(() => {
    if (!passphrases) {
      getPassphraseInfos()
    }
  }, [passphrases])

  useEffect(() => {
    if (!latestBackup) {
      getLatestBackup()
    }
  }, [latestBackup, walletId])

  const recoverGoogleDrive = async (passphraseId: string) => {
    const token = await getGoogleDriveCredentials()
    return gdriveRecover(token, passphraseId)
  }

  const backupGoogleDrive = async (passphrase: string, passphraseId: string) => {
    const token = await getGoogleDriveCredentials()
    return gdriveBackup(token, passphrase, passphraseId)
  }

  const recoverPassphraseId: (passphraseId: string) => Promise<string> = async (passphraseId) => {
    await getPassphraseInfos()

    if (passphrases === null) {
      throw new Error()
    }

    // try to reuse previous
    for (const info of Object.values(passphrases)) {
      if (info.passphraseId === passphraseId) {
        switch (info.location) {
          case 'GoogleDrive': {
            return await recoverGoogleDrive(info.passphraseId)
          }

          default:
            throw new Error(`Unsupported backup location ${location}`)
        }
      }
    }

    throw new Error(`Not found backup location ${location} passphraseId ${passphraseId}`)
  }

  const passphraseRecover: (
    location: TPassphraseLocation,
  ) => Promise<{ passphrase: string; passphraseId: string }> = async (location) => {
    if (passphrases === null) {
      throw new Error()
    }

    // try to reuse previous
    for (const info of Object.values(passphrases)) {
      if (info.location === location) {
        switch (location) {
          case 'GoogleDrive': {
            const passphrase = await recoverGoogleDrive(info.passphraseId)
            return { passphraseId: info.passphraseId, passphrase }
          }
          default:
            throw new Error(`Unsupported backup location ${location}`)
        }
      }
    }

    throw new Error(`Not found backup location ${location}`)
  }

  const passphrasePersist: (
    location: TPassphraseLocation,
  ) => Promise<{ passphrase: string; passphraseId: string }> = async (location) => {
    if (passphrases === null) {
      throw new Error()
    }

    try {
      const recover = await passphraseRecover(location)
      if (recover) {
        return recover
      }
    } catch (e) {
      console.warn(`failed to load previous passphrase, creating new`, e, location)
    }

    // creating new
    const passphrase = randomPassPhrase()
    const passphraseId = crypto.randomUUID()

    switch (location) {
      case 'GoogleDrive': {
        await backupGoogleDrive(passphrase, passphraseId)
        await createPassphraseInfo(passphraseId, location)
        return { passphraseId, passphrase }
      }
      default:
        throw new Error(`Unsupported backup location ${location}`)
    }
  }

  const doBackupKeys = async (
    passphrasePersist: () => Promise<{ passphrase: string; passphraseId: string }>,
  ) => {
    setErr(null)
    setIsBackupInProgress(true)
    setBackupCompleted(false)
    setRecoverCompleted(false)
    try {
      const { passphrase, passphraseId } = await passphrasePersist()
      await backupKeys(passphrase, passphraseId)
      setBackupCompleted(true)
      setIsBackupInProgress(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErr(err.message)
      } else {
        setErr('Unknown Error')
      }
    } finally {
      setIsBackupInProgress(false)
    }
    await getLatestBackup()
  }

  const doRecoverKeys = async (passphraseResolver: (passphraseId: string) => Promise<string>) => {
    if (!walletId) {
      initAppStore()

      await initFireblocksNCW()
    }

    setErr(null)
    setIsRecoverInProgress(true)
    setRecoverCompleted(false)
    setBackupCompleted(false)
    try {
      await recoverKeys(passphraseResolver)
      setAppMode('SIGN_IN')
      await assignCurrentDevice()

      setRecoverCompleted(true)
      setIsRecoverInProgress(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErr(err.message)
      } else {
        setErr('Unknown Error')
      }
    } finally {
      setIsRecoverInProgress(false)
    }
  }

  return {
    handleBackup: () => doBackupKeys(() => passphrasePersist('GoogleDrive')),
    handleRecovery: () => doRecoverKeys(recoverPassphraseId),
    isBackupInProgress,
    isRecoverInProgress,
    backupCompleted,
    recoverCompleted,
    err,
    location: latestBackup?.location,
    createdAt: new Date(latestBackup?.createdAt || '').toString(),
  }
}

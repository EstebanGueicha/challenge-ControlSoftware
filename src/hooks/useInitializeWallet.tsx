import { useEffect, useState } from 'react'
import { useAppStore } from '../store/Appstore'

export const useInitializeWallet = () => {
  const {
    loginToDemoAppServer,
    assignDeviceStatus,
    appStoreInitialized,
    fireblocksNCWStatus,
    initAppStore,
    disposeAppStore,
    setAppMode,
    assignCurrentDevice,
    walletId,
    initFireblocksNCW,
    generateMPCKeys,
  } = useAppStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (appStoreInitialized) {
      loginToDemoAppServer()
      return () => {
        disposeAppStore()
      }
    } else {
      initAppStore()
    }
  }, [loginToDemoAppServer, appStoreInitialized, initAppStore, disposeAppStore])

  useEffect(() => {
    if (walletId && assignDeviceStatus === 'success') {
      initFireblocksNCW()
    }
  }, [walletId, assignDeviceStatus])

  useEffect(() => {
    if (fireblocksNCWStatus === 'sdk_available') {
      generateMPCKeys()
      setLoading(false)
    }
  }, [fireblocksNCWStatus])

  const handleCreateWallet = () => {
    setLoading(true)
    setAppMode('SIGN_IN')
    assignCurrentDevice()
  }

  return {
    loading: loading && fireblocksNCWStatus !== 'sdk_available',
    handleCreateWallet,
    walletId,
    appStoreInitialized,
  }
}

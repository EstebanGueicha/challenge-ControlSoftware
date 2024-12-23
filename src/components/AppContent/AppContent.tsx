import WalletAnimation from '../WalletAnimation'
import { useInitializeWallet } from '../../hooks/useInitializeWallet'
import { useRecoveryAndBackup } from '../../hooks/useRecoveryAndBackup'

const AppContent = () => {
  const { appStoreInitialized, walletId, loading, handleCreateWallet } = useInitializeWallet()
  const {
    handleBackup,
    location,
    createdAt,
    isBackupInProgress,
    handleRecovery,
    isRecoverInProgress,
  } = useRecoveryAndBackup()

  if (!appStoreInitialized) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <WalletAnimation
        onHandleNewWallet={handleCreateWallet}
        walletId={walletId || ''}
        loading={loading || isBackupInProgress || isRecoverInProgress}
        onHandleBackup={handleBackup}
        locationBackup={location}
        createdAtBackup={createdAt}
        isRecovery={isRecoverInProgress}
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleRecovery}
      >
        I want to recover my wallet
      </button>
    </div>
  )
}

export default AppContent

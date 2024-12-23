import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Spinner from '../Spinner'

interface WalletAnimationProps {
  onHandleNewWallet: () => void
  onHandleBackup: () => Promise<void>
  walletId: string
  loading: boolean
  locationBackup?: string
  createdAtBackup?: string
  isRecovery?: boolean
}

const WalletAnimation: FC<WalletAnimationProps> = ({
  onHandleNewWallet,
  walletId,
  loading,
  onHandleBackup,
  locationBackup,
  createdAtBackup,
  isRecovery,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (walletId) setIsOpen(true)
  }, [walletId])

  const toggleWallet = () => {
    if (loading) return
    if (!walletId) onHandleNewWallet()
    else onHandleBackup()
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-80 h-48">
        <div
          className="relative h-full z-10 bg-amber-800  rounded-lg flex items-center justify-center border-dotted border-4 border-amber-700"
          style={{
            transformOrigin: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            onClick={toggleWallet}
            className="w-[100px] hover:bg-amber-900 flex items-center absolute right-[-2px] border rounded-tl-lg rounded-bl-lg border-amber-600 border-solid p-2 cursor-pointer"
          >
            {!isRecovery && <p>{walletId ? 'Backup' : 'New'}</p>}
            {loading && <Spinner />}
          </div>
        </div>
        <motion.div
          animate={{
            translateY: isOpen ? -60 : 0,
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-white rounded-lg flex flex-col p-2 border shadow-lg"
          style={{ zIndex: 6 }}
        >
          <p className="text-black mt-2 text-sm"> Wallet ID: {walletId}</p>
        </motion.div>
        {locationBackup && (
          <motion.div
            animate={{
              translateY: isOpen ? -100 : 0,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            whileHover={{
              translateY: -160,
            }}
            className="absolute z-1 inset-0 bg-white rounded-lg flex flex-col p-2 border"
          >
            <p className="text-black mt-2 text-sm"> Backup Location: {locationBackup}</p>
            <p className="text-black mt-2 text-sm"> Created: {createdAtBackup}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default WalletAnimation

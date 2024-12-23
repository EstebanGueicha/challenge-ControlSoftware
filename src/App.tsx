import { useState } from 'react'
import { useAppStore } from './store/Appstore'
import AppContent from './components/AppContent'
import Login from './components/Login'

function App() {
  const { loggedUser } = useAppStore()
  return (
    <div className="min-h-screen w-full flex flex-col items-center mt-16">
      <h1 className="text-4xl font-bold text-blue-500">Non-Custodial Wallet</h1>
      <div>{loggedUser ? <AppContent /> : <Login />}</div>
    </div>
  )
}

export default App

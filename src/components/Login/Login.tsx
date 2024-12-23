import React from 'react'
import { useAppStore } from '../../store/Appstore'

const Login = () => {
  const { login } = useAppStore()

  const handleLogin = async () => {
    await login('GOOGLE')
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl">Login to start</h2>

      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>
    </div>
  )
}

export default Login

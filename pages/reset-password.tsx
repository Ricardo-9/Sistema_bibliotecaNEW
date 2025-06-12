'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage('Token inválido ou expirado. Por favor, solicite outro email.')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Senha redefinida com sucesso! Redirecionando...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    setLoading(false)
  }

   const handleBack = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4">
      <div className="bg-[#2e8b57] text-white rounded-[30px] shadow-lg p-8 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center drop-shadow-sm">Redefinir Senha</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-[20px] text-black border-none focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#006400] font-semibold py-3 rounded-[50px] hover:bg-gray-200 transition duration-300"
          >
            {loading ? 'Atualizando...' : 'Redefinir senha'}
          </button>
        </form>

        {message && (
          <p className={`text-center font-medium ${message.includes('sucesso') ? 'text-green-300' : 'text-red-300'}`}>
            {message}
          </p>
        )}
        <button
          onClick={handleBack}
          className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
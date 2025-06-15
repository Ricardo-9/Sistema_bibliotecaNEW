'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Image from 'next/image'
import { ArrowLeft, KeyRound } from 'lucide-react'
import brasao from './imgs/Bc.png.png'

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
        router.push('/')
      }, 2000)
    }

    setLoading(false)
  }

  const handleBack = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/perfil')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="relative z-10 bg-[#2e8b57] text-white rounded-[30px] shadow-lg p-8 sm:p-12 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3 drop-shadow">
          <KeyRound className="w-7 h-7" /> Redefinir Senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Nova senha"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-full text-green-900 font-semibold border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#006400] font-bold py-3 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            {loading ? 'Atualizando...' : 'Redefinir Senha'}
          </button>
        </form>

        {message && (
          <p
            className={`text-center font-medium ${
              message.toLowerCase().includes('sucesso') ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

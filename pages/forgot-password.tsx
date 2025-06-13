'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Image from 'next/image'
import { ArrowLeft, KeyRound } from 'lucide-react'
import brasao from './imgs/Bc.png.png'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!email) {
      setError('Por favor, insira seu e-mail.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
      setEmail('')
    }
    setLoading(false)
  }

  const handleBack = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      {/* Brasão semi-transparente no fundo */}
      

      {/* Botão voltar no canto superior direito */}
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Container do formulário */}
      <div className="relative z-10 bg-[#2e8b57] text-white rounded-[30px] shadow-lg p-8 sm:p-12 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3 drop-shadow">
          <KeyRound className="w-7 h-7" /> Esqueceu sua senha?
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-full text-green-900 font-semibold border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#006400] font-bold py-3 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        {message && (
          <p className="text-center font-medium text-green-300">{message}</p>
        )}
        {error && (
          <p className="text-center font-medium text-red-300">{error}</p>
        )}
      </div>
    </div>
  )
}

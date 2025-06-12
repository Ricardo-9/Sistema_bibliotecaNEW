'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) {
      setError('Por favor, insira seu e-mail.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
    }
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
    <div className="min-h-screen flex items-center justify-center bg-[#006400] px-4 py-10">
      <div className="bg-[#2e8b57] text-white rounded-[30px] shadow-lg p-8 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center drop-shadow-sm">Esqueceu sua senha?</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[20px] text-black border-none focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="w-full bg-white text-[#006400] font-semibold py-3 rounded-[50px] hover:bg-gray-200 transition duration-300"
          >
            Enviar link de recuperação
          </button>
        </form>

        {message && <p className="text-green-300 text-center">{message}</p>}
        {error && <p className="text-red-300 text-center">{error}</p>}

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
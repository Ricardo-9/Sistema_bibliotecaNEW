import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
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

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password', // página para onde o usuário será levado após clicar no link no e-mail
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Esqueceu sua senha?</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border border-gray-400 rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Enviar link de recuperação
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  )
}
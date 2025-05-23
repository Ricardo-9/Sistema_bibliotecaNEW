import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Quando o token está na URL, o Supabase já autentica automaticamente.
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

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Senha redefinida com sucesso!')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Nova senha"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Redefinir senha'}
        </button>
        {message && <p className="text-red-500">{message}</p>}
      </form>
    </div>
  )
}
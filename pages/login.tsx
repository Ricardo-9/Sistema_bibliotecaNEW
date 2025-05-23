import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (error) {
      setErro(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="p-2 border rounded mb-2 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="p-2 border rounded mb-2 w-64"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      {erro && <p className="text-red-500 mb-2">{erro}</p>}
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Entrar
      </button>
      <a href='/forgot-password'>Esqueceu sua senha?Clique aqui</a>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Perfil from './imgs/img1.png'

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
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-64 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <div>
          <button onClick={() => router.push('/')} className='bg-[#006400] text-white font-bold rounded-full absolute top-16 left-16 px-4 py-2 hover:bg-[#004d00]'>Voltar</button>
        </div>
          <div className='flex items-center justify-center'>
            
          </div>
        <div className="mb-4">
          <input
            type="email"
            id="email"
            placeholder="Digite seu email"
            className="w-full p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            className="w-full p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <div className='flex justify-center mt-16'>
          <button
          onClick={handleLogin}
          className="px-12 py-3 bg-[#006400] text-white rounded-full h-14 font-bold text-lg hover:bg-[#004d00]"
        >
          Login
        </button>
        </div>
        



        <div className="mt-4 text-center">
          <a href='/forgot-password' className="text-sm text-white hover:text-white">Esqueceu sua senha? Clique aqui</a>
        </div>
      </div>
    </div>
  )
}//
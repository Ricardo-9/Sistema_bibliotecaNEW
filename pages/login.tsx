'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Perfil from './imgs/img1.png'
import { AtSign, Lock ,ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setErro('')

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error || !loginData?.user) {
      setErro(error?.message || 'Erro ao fazer login')
      return
    }

    const userEmail = loginData.user.email

    // Verifica se é aluno
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .ilike('email', userEmail!)
      .maybeSingle()

    if (aluno) {
      router.push('/painel_aluno')
      return
    }

    // Verifica se é funcionário
    const { data: funcionario } = await supabase
      .from('funcionarios')
      .select('id')
      .ilike('email', userEmail!)
      .maybeSingle()

    if (funcionario) {
      router.push('/dashboard')
      return
    }

    setErro('Usuário não encontrado como aluno ou funcionário')
  }

  return (
    <div className="min-h-screen bg-[#006400] flex flex-col items-center justify-center px-6 sm:px-6 lg:px-8">
      
      <button
              onClick={() => router.push('/')}
              className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

      <div className="bg-[#2e8b57] rounded-[30px] shadow-2xl max-w-md w-full p-8 sm:p-10 flex flex-col items-center">

        <Image
          src={Perfil}
          alt="Imagem de perfil"
          width={160}
          height={160}
          className="mb-8 rounded-full shadow-lg"
          priority
        />

        {/* Input Email */}
        <div className="relative w-full mb-6">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-70" size={24} />
          <input
            type="email"
            id="email"
            placeholder="Digite seu email"
            className="w-full pl-12 pr-4 py-4 rounded-full bg-[#006400] border-2 border-transparent focus:border-green-400 focus:ring-4 focus:ring-green-600 text-white font-semibold placeholder-white placeholder-opacity-70 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Input Senha */}
        <div className="relative w-full mb-6">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-70" size={24} />
          <input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            className="w-full pl-12 pr-4 py-4 rounded-full bg-[#006400] border-2 border-transparent focus:border-green-400 focus:ring-4 focus:ring-green-600 text-white font-semibold placeholder-white placeholder-opacity-70 transition"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {erro && (
          <p className="text-red-400 text-center mb-6 font-medium">{erro}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-[#004d00] hover:bg-[#003300] text-white font-bold rounded-full py-4 text-lg shadow-lg transition"
        >
          Entrar
        </button>

        <a
          href="/forgot-password"
          className="mt-6 text-sm text-white hover:underline hover:text-green-300 transition"
        >
          Esqueceu sua senha? Clique aqui
        </a>
      </div>
    </div>
  )
}

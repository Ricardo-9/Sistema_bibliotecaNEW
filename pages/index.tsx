'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'
import { AtSign, Lock, ArrowLeft } from 'lucide-react'
import { withGuestProtection } from '../components/withGuestProtection'

function LoginPage() {
  const [step, setStep] = useState<'login' | 'role'>('login')
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

    const { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .ilike('email', userEmail!)
      .maybeSingle()

    if (aluno) {
      router.push('/painel_aluno')
      return
    }

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
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10 relative">
      {step === 'role' && (
        <button
          onClick={() => setStep('login')}
          className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <div className="bg-[#2e8b57] rounded-3xl shadow-lg w-full max-w-[800px] p-10 md:p-16 text-center space-y-10">
        <div className="flex justify-center">
          <Image src={brasao} alt="Logo" width={100} height={100} />
        </div>

        {step === 'login' && (
          <>
            <h1 className="text-4xl font-bold text-white">Bem-vindo!</h1>

            <div className="space-y-6">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={24} />
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-[#006400] border-2 border-transparent focus:border-green-400 focus:ring-4 focus:ring-green-600 text-white font-semibold placeholder-white placeholder-opacity-70 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={24} />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-[#006400] border-2 border-transparent focus:border-green-400 focus:ring-4 focus:ring-green-600 text-white font-semibold placeholder-white placeholder-opacity-70 transition"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              {erro && <p className="text-red-400 text-center font-medium">{erro}</p>}

              <button
                onClick={handleLogin}
                className="w-full bg-[#004d00] hover:bg-[#003300] text-white font-bold rounded-full py-4 text-lg shadow-lg transition"
              >
                Entrar
              </button>

              <a
                href="/forgot-password"
                className="block text-sm text-white hover:underline hover:text-green-300 transition text-center"
              >
                Esqueceu sua senha? Clique aqui
              </a>

              <div className="pt-6">
                <button
                  onClick={() => setStep('role')}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#006400] transition-all duration-300 shadow text-lg"
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'role' && (
          <>
            <h2 className="text-3xl font-bold text-white">Cadastro</h2>
            <p className="text-xl text-gray-200 mb-6">Selecione sua função:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => router.push('/signup-aluno')}
                className="bg-[#006400] hover:bg-[#004d00] text-white font-semibold py-6 px-6 rounded-[2rem] transition duration-300 shadow-md hover:scale-105 text-xl"
              >
                Aluno
              </button>
              <button
                onClick={() => router.push('/signup-funcionario')}
                className="bg-[#006400] hover:bg-[#004d00] text-white font-semibold py-6 px-6 rounded-[2rem] transition duration-300 shadow-md hover:scale-105 text-xl"
              >
                Funcionário
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


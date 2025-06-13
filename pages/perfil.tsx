'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

import {
  User,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  GraduationCap,
  Lock,
  LogOut,
  ArrowLeft,
  BookOpenCheck,
  Pencil
} from 'lucide-react'

type PerfilUsuario = {
  nome: string
  email: string
  cpf: string
  endereco: string
  telefone: string
  tipo: 'aluno' | 'funcionario' | 'funcionario_administrador'
  matricula?: string
  curso?: string
  serie?: string
  funcao?: string
}

function Perfil() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const carregarPerfil = async () => {
      const {
        data: { user },
        error: erroUser,
      } = await supabase.auth.getUser()

      if (erroUser || !user) {
        setErro('Usuário não autenticado')
        return
      }

      const { data: aluno } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (aluno) {
        setUsuario({
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          endereco: aluno.endereco,
          telefone: aluno.telefone,
          matricula: aluno.matricula,
          curso: aluno.curso,
          serie: aluno.serie,
          tipo: 'aluno',
        })
        return
      }

      const { data: funcionario } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (funcionario) {
        setUsuario({
          nome: funcionario.nome,
          email: funcionario.email,
          cpf: funcionario.cpf,
          endereco: funcionario.endereco,
          telefone: funcionario.telefone,
          funcao: funcionario.funcao,
          tipo: funcionario.funcao === 'administrador' ? 'funcionario_administrador' : 'funcionario',
        })
        return
      }

      setErro('Usuário não encontrado')
    }

    carregarPerfil()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRedirect = () => {
    
    if (usuario.tipo === 'aluno') {
      router.push('/painel_aluno')
    } else if (usuario.tipo === 'funcionario' || usuario.tipo === 'funcionario_administrador') {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10 relative">
      <button
        onClick={handleRedirect}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-3xl bg-[#2e8b57] text-white rounded-[30px] shadow-2xl px-[25px] py-12 space-y-6 relative z-10">
        <h1 className="text-4xl font-bold text-center mb-6 drop-shadow">Meu Perfil</h1>

        {erro && <p className="text-red-300 font-semibold text-center">{erro}</p>}

        {usuario ? (
          <div className="space-y-6 text-base sm:text-lg">
            <div className="bg-[#1f6f43] rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white pb-2">
                <User className="w-5 h-5" /> Informações Pessoais
              </h2>
              <p><strong>Nome:</strong> {usuario.nome}</p>
              <p><strong>Email:</strong> <Mail className="inline w-4 h-4 mr-1" />{usuario.email}</p>
              <p><strong>CPF:</strong> <BadgeCheck className="inline w-4 h-4 mr-1" />{usuario.cpf}</p>
              <p><strong>Endereço:</strong> <MapPin className="inline w-4 h-4 mr-1" />{usuario.endereco}</p>
              <p><strong>Telefone:</strong> <Phone className="inline w-4 h-4 mr-1" />{usuario.telefone}</p>
            </div>

            {usuario.tipo === 'aluno' && (
              <div className="bg-[#1f6f43] rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white pb-2">
                  <GraduationCap className="w-5 h-5" /> Informações Acadêmicas
                </h2>
                <p><strong>Matrícula:</strong> {usuario.matricula}</p>
                <p><strong>Série:</strong> {usuario.serie}</p>
                <p><strong>Curso:</strong> {usuario.curso}</p>
              </div>
            )}

            {usuario.tipo === 'funcionario' || usuario.tipo === 'funcionario_administrador' ? (
              <div className="bg-[#1f6f43] rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white pb-2">
                  <User className="w-5 h-5" /> Informações Funcionais
                </h2>
                <p><strong>Função:</strong> {usuario.funcao}</p>
              </div>
            ) : null}

            <div className="text-center">
              <p><strong>Tipo de Usuário:</strong> {usuario.tipo}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => router.push('/editar-perfil')}
                className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-[50px] transition duration-300 shadow-md"
              >
                <Pencil className="w-5 h-5" /> Editar Perfil
              </button>

              <button
                onClick={() => router.push('/forgot-password')}
                className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold py-3 rounded-[50px] hover:bg-emerald-200 transition duration-300 shadow-md border border-emerald-300"
              >
                <Lock className="w-5 h-5" /> Redefinir Senha
              </button>
            </div>

            <button
              onClick={() => router.push('/meus-emprestimos')}
              className="flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-[50px] mt-4 transition duration-300 shadow-md"
            >
              <BookOpenCheck className="w-5 h-5" /> Consultar Empréstimos
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-[50px] mt-4 transition duration-300 shadow-md"
            >
              <LogOut className="w-5 h-5" /> Sair da Conta
            </button>
          </div>
        ) : (
          !erro && <p className="text-center text-white">Carregando perfil...</p>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(Perfil, ['aluno', 'funcionario', 'funcionario_administrador'])

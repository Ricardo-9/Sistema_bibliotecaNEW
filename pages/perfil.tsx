'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'

type PerfilUsuario = {
  nome: string
  email: string
  cpf: string
  endereco: string
  telefone: string
  tipo: 'aluno' | 'funcionario'
  matricula?: string
  curso?: string
  serie?: string
  funcao?: string
}

function Perfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
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
        setPerfil({
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
        setPerfil({
          nome: funcionario.nome,
          email: funcionario.email,
          cpf: funcionario.cpf,
          endereco: funcionario.endereco,
          telefone: funcionario.telefone,
          funcao: funcionario.funcao,
          tipo: 'funcionario',
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

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10">
      <Image
              src={brasao}
              alt="Logo do Ceará"
              width={600}
              height={600}
              className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
            />
      <div className="w-full max-w-3xl bg-[#2e8b57] text-white rounded-[30px] shadow-2xl px-[25px] py-12 space-y-6">
        <h1 className="text-4xl font-bold text-center mb-6 drop-shadow">Meu Perfil</h1>

        {erro && (
          <p className="text-red-300 font-semibold text-center">{erro}</p>
        )}

        {perfil ? (
          <div className="space-y-4 text-lg sm:text-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <p><strong>Nome:</strong> {perfil.nome}</p>
              <p><strong>Email:</strong> {perfil.email}</p>
              <p><strong>CPF:</strong> {perfil.cpf}</p>
              <p><strong>Endereço:</strong> {perfil.endereco}</p>
              <p><strong>Telefone:</strong> {perfil.telefone}</p>

              {perfil.tipo === 'aluno' && (
                <>
                  <p><strong>Matrícula:</strong> {perfil.matricula}</p>
                  <p><strong>Série:</strong> {perfil.serie}</p>
                  <p><strong>Curso:</strong> {perfil.curso}</p>
                </>
              )}

              {perfil.tipo === 'funcionario' && (
                <p><strong>Função:</strong> {perfil.funcao}</p>
              )}

              <p><strong>Tipo de Usuário:</strong> {perfil.tipo}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => router.push('/editar-perfil')}
                className="w-full sm:w-1/2 bg-[#004d00] hover:bg-[#003f00] text-white font-semibold py-3 rounded-[50px] transition duration-300 shadow-md"
              >
                Editar Perfil
              </button>

              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full sm:w-1/2 border-2 border-white text-white hover:bg-white hover:text-[#006400] font-semibold py-3 rounded-[50px] transition duration-300 shadow-md"
              >
                Redefinir Senha
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-[50px] mt-4 transition duration-300 shadow-md"
            >
              Sair da Conta
            </button>
          </div>
        ) : (
          !erro && (
            <p className="text-center text-white">Carregando perfil...</p>
          )
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(Perfil, ['aluno', 'funcionario', 'funcionario_administrador'])
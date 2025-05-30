'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

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
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>

      {erro && <p className="text-red-500">{erro}</p>}

      {perfil ? (
        <div className="space-y-2">
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

          {/* Botões de ação */}
          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={() => router.push('/editar-perfil')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Editar Perfil
            </button>

            <button
              onClick={() => router.push('/forgot-password')}
              className="text-sm text-blue-600 underline"
            >
              Redefinir senha
            </button>

            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Sair da conta
            </button>
          </div>
        </div>
      ) : (
        !erro && <p>Carregando perfil...</p>
      )}
    </div>
  )
}

export default withRoleProtection(Perfil, ['aluno', 'funcionario', 'funcionario_administrador'])
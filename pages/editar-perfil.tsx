'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

type PerfilUsuario = {
  tipo: 'aluno' | 'funcionario'
  nome: string
  email: string
  cpf: string
  endereco: string
  telefone: string
  matricula?: string
  curso?: string
  serie?: string
  funcao?: string
}

function EditarPerfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { user }, error: erroUser } = await supabase.auth.getUser()

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
          tipo: 'aluno',
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          endereco: aluno.endereco,
          telefone: aluno.telefone,
          matricula: aluno.matricula,
          curso: aluno.curso,
          serie: aluno.serie
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
          tipo: 'funcionario',
          nome: funcionario.nome,
          email: funcionario.email,
          cpf: funcionario.cpf,
          endereco: funcionario.endereco,
          telefone: funcionario.telefone,
          funcao: funcionario.funcao
        })
        return
      }

      setErro('Usuário não encontrado')
    }

    carregarPerfil()
  }, [])

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !perfil) return

    const tabela = perfil.tipo === 'aluno' ? 'alunos' : 'funcionarios'

    const { error } = await supabase
      .from(tabela)
      .update({
        nome: perfil.nome,
        email: perfil.email,
        cpf: perfil.cpf,
        endereco: perfil.endereco,
        telefone: perfil.telefone,
        ...(perfil.tipo === 'aluno' && {
          matricula: perfil.matricula,
          curso: perfil.curso,
          serie: perfil.serie
        }),
        ...(perfil.tipo === 'funcionario' && {
          funcao: perfil.funcao
        })
      })
      .eq('user_id', user.id)

    if (error) {
      setErro('Erro ao atualizar perfil: ' + error.message)
    } else {
      setMensagem('Perfil atualizado com sucesso!')
      setTimeout(() => router.push('/perfil'), 2000)
    }
  }

  if (!perfil && !erro) return <p className="p-4">Carregando...</p>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>

      {erro && <p className="text-red-600">{erro}</p>}
      {mensagem && <p className="text-green-600">{mensagem}</p>}

      {perfil && (
        <form onSubmit={handleSalvar} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Nome"
            value={perfil.nome}
            onChange={e => setPerfil({ ...perfil, nome: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={perfil.email}
            onChange={e => setPerfil({ ...perfil, email: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="CPF"
            value={perfil.cpf}
            onChange={e => setPerfil({ ...perfil, cpf: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Endereço"
            value={perfil.endereco}
            onChange={e => setPerfil({ ...perfil, endereco: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Telefone"
            value={perfil.telefone}
            onChange={e => setPerfil({ ...perfil, telefone: e.target.value })}
          />

          {perfil.tipo === 'aluno' && (
            <>
              <input
                className="w-full border p-2 rounded"
                placeholder="Matrícula"
                value={perfil.matricula}
                onChange={e => setPerfil({ ...perfil, matricula: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Curso"
                value={perfil.curso}
                onChange={e => setPerfil({ ...perfil, curso: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Série"
                value={perfil.serie}
                onChange={e => setPerfil({ ...perfil, serie: e.target.value })}
              />
            </>
          )}

          {perfil.tipo === 'funcionario' && (
            <input
              className="w-full border p-2 rounded"
              placeholder="Função"
              value={perfil.funcao}
              onChange={e => setPerfil({ ...perfil, funcao: e.target.value })}
            />
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Salvar Alterações
          </button>
        </form>
      )}
    </div>
  )
}

export default withRoleProtection(EditarPerfil, ['aluno', 'funcionario', 'funcionario_administrador'])

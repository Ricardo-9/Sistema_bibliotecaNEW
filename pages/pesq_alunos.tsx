'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

type Alunos = {
  id: string
  nome: string
  cpf: string
  matricula: string
  endereco: string
  email: string
  telefone: string
  serie: string
  curso: string
}

type Props = {
  role: string
}

function PesqAlunos({ role }: Props) {
  const router = useRouter()
  const [alunos, setAlunos] = useState<Alunos[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchAlunos = async (nomeFiltro?: string) => {
    setCarregando(true)

    let query = supabase.from('alunos').select('*').order('created_at', { ascending: false })

    if (nomeFiltro && nomeFiltro.trim() !== '') {
      query = query.ilike('nome', `%${nomeFiltro}%`)
    }

    const { data, error } = await query
    setCarregando(false)

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setAlunos(data || [])
    }
  }

  useEffect(() => {
    fetchAlunos()
  }, [])

  const deleteAluno = async (id: string) => {
    await supabase.from('alunos').delete().eq('id', id)
    fetchAlunos(filtroNome)
  }

  const handlePesquisar = () => {
    fetchAlunos(filtroNome)
  }

  return (
    <div>
      <h1>Pesquisar alunos</h1>

      <div>
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Digite o nome do aluno"
        />
        <button onClick={handlePesquisar}>Pesquisar</button>
        <button onClick={() => router.push('/signup-aluno')}>Cadastrar Aluno</button>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : alunos.length === 0 ? (
        <p>Nenhum aluno encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Matricula</th>
              <th>Endereço</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Série</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.cpf}</td>
                <td>{aluno.matricula}</td>
                <td>{aluno.endereco}</td>
                <td>{aluno.email}</td>
                <td>{aluno.telefone}</td>
                <td>{aluno.serie}</td>
                <td>{aluno.curso}</td>
                <td>
                  {role === 'funcionario' && (
                    <>
                      <button onClick={() => deleteAluno(aluno.id)}>Excluir</button>
                      <button onClick={() => router.push(`/updates/update_alunos/${aluno.id}`)}>Editar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default withRoleProtection(PesqAlunos, ['aluno', 'funcionario'])
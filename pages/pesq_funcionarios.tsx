'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

type Funcionarios = {
  id: string
  nome: string
  funcao: string
  cpf: string
  email: string
  endereco: string
  telefone: string
}

type Props = {
  role: string
}

function PesqFuncionarios({ role }: Props) {
  const router = useRouter()
  const [funcionarios, setFuncionarios] = useState<Funcionarios[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchFuncionarios = async (nomeFiltro?: string) => {
    setCarregando(true)

    let query = supabase.from('funcionarios').select('*').order('created_at', { ascending: false })

    if (nomeFiltro && nomeFiltro.trim() !== '') {
      query = query.ilike('nome', `%${nomeFiltro}%`)
    }

    const { data, error } = await query
    setCarregando(false)

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setFuncionarios(data || [])
    }
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const deleteFuncionarios = async (id: string) => {
    await supabase.from('funcionarios').delete().eq('id', id)
    fetchFuncionarios(filtroNome)
  }

  const handlePesquisar = () => {
    fetchFuncionarios(filtroNome)
  }

  return (
    <div>
      <h1>Pesquisar Funcionários</h1>

      <div>
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Digite o nome do funcionário"
        />
        <button onClick={handlePesquisar}>Pesquisar</button>
        <button onClick={() => router.push('/signup-funcionario')}>Cadastrar Funcionário</button>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : funcionarios.length === 0 ? (
        <p>Nenhum funcionário encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Função</th>
              <th>Endereço</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <tr key={funcionario.id}>
                <td>{funcionario.nome}</td>
                <td>{funcionario.cpf}</td>
                <td>{funcionario.funcao}</td>
                <td>{funcionario.endereco}</td>
                <td>{funcionario.email}</td>
                <td>{funcionario.telefone}</td>
                <td>
                    <>
                      <button onClick={() => deleteFuncionarios(funcionario.id)}>Excluir</button>
                      <button onClick={() => router.push(`/updates/update_funcionarios/${funcionario.id}`)}>Editar</button>
                    </>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ✅ Acesso restrito apenas a funcionários
export default withRoleProtection(PesqFuncionarios, ['funcionario_administrador'])
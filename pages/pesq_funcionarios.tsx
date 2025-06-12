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
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome do funcionário"
            className="p-3 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-16 w-3/5 text-white font-bold"
          />
          <button
            onClick={handlePesquisar}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Pesquisar
          </button>
          <button
            onClick={() => router.push('/signup-funcionario')}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Cadastrar Funcionário
          </button>
        </div>

        {carregando ? (
          <p className="text-white font-bold">Carregando...</p>
        ) : funcionarios.length === 0 ? (
          <p className="text-white font-bold">Nenhum funcionário encontrado.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Nome</th>
                <th className="px-4 py-2 text-white">CPF</th>
                <th className="px-4 py-2 text-white">Função</th>
                <th className="px-4 py-2 text-white">Endereço</th>
                <th className="px-4 py-2 text-white">Email</th>
                <th className="px-4 py-2 text-white">Telefone</th>
                <th className="px-4 py-2 text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id} className="bg-[#2e8b57] text-white">
                  <td className="border border-[#006400] px-4 py-2">{funcionario.nome}</td>
                  <td className="border border-[#006400] px-4 py-2">{funcionario.cpf}</td>
                  <td className="border border-[#006400] px-4 py-2">{funcionario.funcao}</td>
                  <td className="border border-[#006400] px-4 py-2">{funcionario.endereco}</td>
                  <td className="border border-[#006400] px-4 py-2">{funcionario.email}</td>
                  <td className="border border-[#006400] px-4 py-2">{funcionario.telefone}</td>
                  <td className="border border-[#006400] px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => deleteFuncionarios(funcionario.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => router.push(`/updates/update_funcionarios/${funcionario.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ✅ Acesso restrito apenas a funcionários
export default withRoleProtection(PesqFuncionarios, ['funcionario_administrador'])

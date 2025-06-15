'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import {
  Search,
  PlusCircle,
  Trash2,
  Pencil,
  UserCheck,
  ArrowLeft
} from 'lucide-react'

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

  const deleteFuncionario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return
    await supabase.from('funcionarios').delete().eq('id', id)
    fetchFuncionarios(filtroNome)
  }

  const handlePesquisar = () => {
    fetchFuncionarios(filtroNome)
  }

  return (
    <div className="min-h-screen bg-[#006400] flex flex-col items-center justify-start px-4 py-10 relative">
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl bg-[#2e8b57] rounded-[30px] p-8 shadow-2xl z-10 text-white">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2 drop-shadow">
          <UserCheck className="w-8 h-8" /> Pesquisa de Funcionários
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome do funcionário..."
            className="w-full md:w-2/3 px-6 py-3 rounded-full bg-[#006400] text-white font-medium placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
          />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handlePesquisar}
              className="flex items-center gap-2 bg-white text-[#006400] font-semibold px-5 py-2 rounded-full hover:bg-emerald-100 transition shadow"
            >
              <Search className="w-5 h-5" /> Pesquisar
            </button>
          
    
              <PlusCircle clas
          </div>
        </div>

        {carregando ? (
          <p className="text-center text-lg font-semibold">Carregando...</p>
        ) : funcionarios.length === 0 ? (
          <p className="text-center text-lg font-semibold">Nenhum funcionário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f6f43] text-white text-sm sm:text-base">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">CPF</th>
                  <th className="px-4 py-3">Função</th>
                  <th className="px-4 py-3">Endereço</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((funcionario) => (
                  <tr
                    key={funcionario.id}
                    className="odd:bg-[#2e8b57] even:bg-[#237e4d] text-white"
                  >
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.nome}</td>
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.cpf}</td>
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.funcao}</td>
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.endereco}</td>
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.email}</td>
                    <td className="px-4 py-3 border border-[#006400]">{funcionario.telefone}</td>
                    <td className="px-4 py-3 border border-[#006400] text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => deleteFuncionario(funcionario.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1 shadow-sm"
                          aria-label={`Excluir funcionário ${funcionario.nome}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/updates/update_funcionarios/${funcionario.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1 shadow-sm"
                          aria-label={`Editar funcionário ${funcionario.nome}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(PesqFuncionarios, ['funcionario_administrador'])

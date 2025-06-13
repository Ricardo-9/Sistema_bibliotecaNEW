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
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome do aluno"
            className="p-3 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-16 w-3/5 text-white font-bold"
          />
          <button
            onClick={handlePesquisar}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Pesquisar
          </button>
          <button
            onClick={() => router.push('/signup-aluno')}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Cadastrar Aluno
          </button>
        </div>

        {carregando ? (
          <p>Carregando...</p>
        ) : alunos.length === 0 ? (
          <p>Nenhum aluno encontrado.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Nome</th>
                <th className="px-4 py-2 text-white">CPF</th>
                <th className="px-4 py-2 text-white">Matricula</th>
                <th className="px-4 py-2 text-white">Endereço</th>
                <th className="px-4 py-2 text-white">Email</th>
                <th className="px-4 py-2 text-white">Telefone</th>
                <th className="px-4 py-2 text-white">Série</th>
                <th className="px-4 py-2 text-white">Curso</th>
                <th className="px-4 py-2 text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id} className="bg-[#2e8b57] text-white">
                  <td className="border border-[#006400] px-4 py-2">{aluno.nome}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.cpf}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.matricula}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.endereco}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.email}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.telefone}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.serie}</td>
                  <td className="border border-[#006400] px-4 py-2">{aluno.curso}</td>
                  <td className="border border-[#006400] px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => deleteAluno(aluno.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => router.push(`/updates/update_alunos/${aluno.id}`)}
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


export default withRoleProtection(PesqAlunos, ['funcionario_administrador'])

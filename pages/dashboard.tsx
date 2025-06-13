'use client'

import { withRoleProtection } from '../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import {
  BookOpen,
  User,
  UserCheck,
  Landmark,
} from 'lucide-react'

type Props = {
  role: string // vem do HOC
}

function DashboardPesquisaUnificada({ role }: Props) {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dados, setDados] = useState({
    livros: 0,
    alunos: 0,
    funcionarios: 0,
    editoras: 0,
  })

  const router = useRouter()

  useEffect(() => {
    async function fetchDados() {
      setLoading(true)
      setErro(null)

      try {
        const [livrosRes, alunosRes, funcRes, editorasRes] = await Promise.all([
          supabase.from('livros').select('id', { head: true, count: 'exact' }),
          supabase.from('alunos').select('id', { head: true, count: 'exact' }),
          supabase.from('funcionarios').select('id', { head: true, count: 'exact' }),
          supabase.from('editoras').select('id', { head: true, count: 'exact' }),
        ])

        if (livrosRes.error) throw livrosRes.error
        if (alunosRes.error) throw alunosRes.error
        if (funcRes.error) throw funcRes.error
        if (editorasRes.error) throw editorasRes.error

        setDados({
          livros: livrosRes.count ?? 0,
          alunos: alunosRes.count ?? 0,
          funcionarios: funcRes.count ?? 0,
          editoras: editorasRes.count ?? 0,
        })
      } catch (error: any) {
        setErro(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDados()
  }, [])

  if (loading) return <p className="p-4 text-white">Carregando...</p>
  if (erro) return <p className="text-red-500 p-4">Erro: {erro}</p>

  const cards = [
    {
      nome: 'Alunos',
      total: dados.alunos,
      icon: <User className="w-10 h-10 text-green-600" />,
    },
    {
      nome: 'Funcionários',
      total: dados.funcionarios,
      icon: <UserCheck className="w-10 h-10 text-green-600" />,
    },
    {
      nome: 'Editoras',
      total: dados.editoras,
      icon: <Landmark className="w-10 h-10 text-green-600" />,
    },
    {
      nome: 'Livros',
      total: dados.livros,
      icon: <BookOpen className="w-10 h-10 text-green-600" />,
    },
  ]

  const botoes = [
    { label: 'Pesquisar Editoras', path: '/pesq_editoras' },
      { label: 'Pesquisar Livros', path: '/pesq_livros' },
      { label: 'Pesquisar Empréstimos', path: '/p_emprestimos' },
    ...(role === 'funcionario_administrador' ? [
      { label: 'Pesquisar Alunos', path: '/pesq_alunos' },
    { label: 'Pesquisar Funcionários', path: '/pesq_funcionarios' },
      
      
      
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-[#006400] py-10">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-white">Painel Geral</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {cards.map((item) => (
            <div
              key={item.nome}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300"
            >
              {item.icon}
              <h2 className="text-lg font-semibold text-gray-800 mt-4">{item.nome}</h2>
              <p className="text-3xl font-bold text-green-700 mt-2">{item.total}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {botoes.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              className="w-full bg-[#004d00] hover:bg-[#003f00] text-white font-semibold py-4 px-6 rounded-[70px] transition duration-300 shadow-md"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default withRoleProtection(DashboardPesquisaUnificada, ['funcionario', 'funcionario_administrador'])

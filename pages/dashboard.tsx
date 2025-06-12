'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function DashboardPesquisaUnificada() {
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

  if (loading) return <p className="p-4">Carregando...</p>
  if (erro) return <p className="text-red-500 p-4">Erro: {erro}</p>

  const totalUsuarios = dados.alunos + dados.funcionarios

  const data = [
    { nome: 'Alunos', total: dados.alunos },
    { nome: 'Funcionários', total: dados.funcionarios },
    { nome: 'Editoras', total: dados.editoras },
    { nome: 'Livros', total: dados.livros },
  ]

return (
  <div className="min-h-screen bg-[#006400] py-10">
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Painel Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {data.map((item) => (
          <div key={item.nome} className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{item.nome}</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={[item]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" hide />
                <Tooltip />
                <Bar dataKey="total" fill="#16a34a" barSize={30} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-lg mt-2">Total: {item.total}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Pesquisar Alunos", path: "/pesq_alunos" },
          { label: "Pesquisar Funcionários", path: "/pesq_funcionarios" },
          { label: "Pesquisar Editoras", path: "/pesq_editoras" },
          { label: "Pesquisar Livros", path: "/pesq_livros" },
          { label: "Pesquisar Empréstimos", path: "/p_emprestimos" },
        ].map(({ label, path }) => (
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
)}
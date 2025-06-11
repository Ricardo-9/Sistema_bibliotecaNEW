'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Loading from '../components/Loading'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [totalLivros, setTotalLivros] = useState(0)
  const [totalAlunos, setTotalAlunos] = useState(0)
  const [totalFuncionarios, setTotalFuncionarios] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalEditoras, setTotalEditoras] = useState(0)

  useEffect(() => {
    async function fetchDadosDashboard() {
      setLoading(true)
      setErro(null)

      try {
        const [
          livrosResponse,
          alunosResponse,
          funcionariosResponse,
          editorasResponse,
        ] = await Promise.all([
          supabase.from('livros').select('id', { head: true, count: 'exact' }),
          supabase.from('alunos').select('id', { head: true, count: 'exact' }),
          supabase.from('funcionarios').select('id', { head: true, count: 'exact' }),
          supabase.from('editoras').select('id', { head: true, count: 'exact' }),
        ])

        if (livrosResponse.error) throw new Error('Erro ao carregar livros: ' + livrosResponse.error.message)
        if (alunosResponse.error) throw new Error('Erro ao carregar alunos: ' + alunosResponse.error.message)
        if (funcionariosResponse.error) throw new Error('Erro ao carregar funcionários: ' + funcionariosResponse.error.message)
        if (editorasResponse.error) throw new Error('Erro ao carregar editoras: ' + editorasResponse.error.message)

        const totalLivrosCount = livrosResponse.count ?? 0
        const totalAlunosCount = alunosResponse.count ?? 0
        const totalFuncionariosCount = funcionariosResponse.count ?? 0
        const totalEditorasCount = editorasResponse.count ?? 0

        setTotalLivros(totalLivrosCount)
        setTotalAlunos(totalAlunosCount)
        setTotalFuncionarios(totalFuncionariosCount)
        setTotalEditoras(totalEditorasCount)
        setTotalUsuarios(totalAlunosCount + totalFuncionariosCount)
      } catch (error: any) {
        setErro(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDadosDashboard()
  }, [])

  if (loading) return <Loading/>
  if (erro) return <p>{erro}</p>

  return (
    <div>
      <h1>Dashboard do Sistema</h1>
      <ul>
        <li>Total de livros: {totalLivros}</li>
        <li>Total de usuários: {totalUsuarios}</li>
        <li>Total de alunos: {totalAlunos}</li>
        <li>Total de funcionários: {totalFuncionarios}</li>
        <li>Total de editoras: {totalEditoras}</li>
      </ul>
    </div>
  )
}
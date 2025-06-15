'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import {
  Search,
  ArrowLeft,
  Book,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'

type EmprestimoBruto = {
  id: string
  nome_livro: number
  solicitante_id: string
  tipo_solicitante: 'aluno' | 'funcionario'
  data_emprestimo: string
  data_devolucao: string
  devolvido: boolean
}

type EmprestimoFinal = {
  id: string
  nome_livro: string
  nome_solicitante: string
  tipo_solicitante: string
  data_emprestimo: string
  data_devolucao: string
  devolvido: boolean
}

function PesqEmprestimos() {
  const router = useRouter()
  const [emprestimos, setEmprestimos] = useState<EmprestimoFinal[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchEmprestimos = async (filtro?: string) => {
    setCarregando(true)
    let query = supabase
      .from('emprestimos')
      .select('*')
      .order('data_emprestimo', { ascending: false })

    if (filtro && filtro.trim() !== '') {
      const { data: livrosFiltrados } = await supabase
        .from('livros')
        .select('id')
        .ilike('nome', `%${filtro}%`)
      const livrosIds = livrosFiltrados?.map(l => l.id) || []
      if (livrosIds.length > 0) {
        query = query.in('nome_livro', livrosIds)
      } else {
        setEmprestimos([])
        setCarregando(false)
        return
      }
    }

    const { data: emprestimosBrutos, error } = await query

    if (error || !emprestimosBrutos) {
      console.error(error)
      alert('Erro ao buscar empréstimos: ' + error?.message)
      setCarregando(false)
      return
    }

    const emprestimosCompletos: EmprestimoFinal[] = []

    for (const emprestimo of emprestimosBrutos as EmprestimoBruto[]) {
      const { data: livro } = await supabase
        .from('livros')
        .select('nome')
        .eq('id', emprestimo.nome_livro)
        .single()

      let nome_solicitante = 'Desconhecido'
      if (emprestimo.tipo_solicitante === 'aluno') {
        const { data: aluno } = await supabase
          .from('alunos')
          .select('nome')
          .eq('id', emprestimo.solicitante_id)
          .single()
        nome_solicitante = aluno?.nome || nome_solicitante
      } else if (emprestimo.tipo_solicitante === 'funcionario') {
        const { data: funcionario } = await supabase
          .from('funcionarios')
          .select('nome')
          .eq('id', emprestimo.solicitante_id)
          .single()
        nome_solicitante = funcionario?.nome || nome_solicitante
      }

      emprestimosCompletos.push({
        id: emprestimo.id,
        nome_livro: livro?.nome || 'Desconhecido',
        nome_solicitante,
        tipo_solicitante: emprestimo.tipo_solicitante,
        data_emprestimo: new Date(emprestimo.data_emprestimo).toLocaleDateString(),
        data_devolucao: new Date(emprestimo.data_devolucao).toLocaleDateString(),
        devolvido: emprestimo.devolvido,
      })
    }

    setEmprestimos(emprestimosCompletos)
    setCarregando(false)
  }

  useEffect(() => {
    fetchEmprestimos()
  }, [])

  const devolverLivro = async (emprestimoId: string) => {
    if (!confirm('Confirma a devolução desse livro?')) return

    try {
      const { data: emprestimo, error: erroEmprestimo } = await supabase
        .from('emprestimos')
        .select('nome_livro')
        .eq('id', emprestimoId)
        .single()

      if (erroEmprestimo || !emprestimo) {
        alert('Erro ao localizar empréstimo.')
        return
      }

      const { data: livro, error: erroLivro } = await supabase
        .from('livros')
        .select('id, q_disponivel')
        .eq('id', emprestimo.nome_livro)
        .single()

      if (erroLivro || !livro) {
        alert('Erro ao localizar livro: ' + erroLivro?.message)
        return
      }

      const { error: errorDelete } = await supabase
        .from('emprestimos')
        .delete()
        .eq('id', emprestimoId)

      if (errorDelete) {
        alert('Erro ao deletar empréstimo: ' + errorDelete.message)
        return
      }

      const { error: errorUpdate } = await supabase
        .from('livros')
        .update({ q_disponivel: livro.q_disponivel + 1 })
        .eq('id', livro.id)

      if (errorUpdate) {
        alert('Erro ao atualizar quantidade disponível: ' + errorUpdate.message)
        return
      }

      alert('Livro devolvido com sucesso!')
      fetchEmprestimos(filtroNome)
    } catch (error) {
      console.error(error)
      alert('Erro inesperado ao devolver livro')
    }
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
          <Book className="w-8 h-8" /> Pesquisa de Empréstimos
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Filtrar por nome do livro..."
            className="w-full md:w-2/3 px-6 py-3 rounded-full bg-[#006400] text-white font-medium placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
          />
          <button
            onClick={() => fetchEmprestimos(filtroNome)}
            className="flex items-center gap-2 bg-white text-[#006400] font-semibold px-5 py-2 rounded-full hover:bg-emerald-100 transition shadow"
          >
            <Search className="w-5 h-5" /> Pesquisar
          </button>
        </div>

        {carregando ? (
          <p className="text-center text-lg font-semibold">Carregando...</p>
        ) : emprestimos.length === 0 ? (
          <p className="text-center text-lg font-semibold">Nenhum empréstimo encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f6f43] text-white text-sm sm:text-base">
                  <th className="px-4 py-3">Livro</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data Empréstimo</th>
                  <th className="px-4 py-3">Data Devolução</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((e) => (
                  <tr
                    key={e.id}
                    className="odd:bg-[#2e8b57] even:bg-[#237e4d] text-white"
                  >
                    <td className="px-4 py-3 border border-[#006400]">{e.nome_livro}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.nome_solicitante}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.tipo_solicitante}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.data_emprestimo}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.data_devolucao}</td>
                    <td className="px-4 py-3 border border-[#006400]">
                      {e.devolvido ? (
                        <span className="flex items-center gap-1 text-green-300 font-semibold">
                          <CheckCircle className="w-5 h-5" /> Devolvido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-300 font-semibold">
                          <XCircle className="w-5 h-5" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#006400] text-center">
                      {!e.devolvido && (
                        <button
                          onClick={() => devolverLivro(e.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 py-2 shadow"
                        >
                          Devolver
                        </button>
                      )}
                      {e.devolvido && (
                        <button
                          disabled
                          className="bg-gray-600 cursor-not-allowed text-white font-bold rounded-full px-4 py-2 opacity-60"
                        >
                          Devolvido
                        </button>
                      )}
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

export default withRoleProtection(PesqEmprestimos, ['funcionario', 'funcionario_administrador'])

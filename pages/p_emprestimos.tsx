'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type EmprestimoBruto = {
  id: string
  nome_livro: string
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
  const [emprestimos, setEmprestimos] = useState<EmprestimoFinal[]>([])
  const [carregando, setCarregando] = useState(false)

  const fetchEmprestimos = async () => {
    setCarregando(true)

    const { data: emprestimosBrutos, error } = await supabase
      .from('emprestimos')
      .select('*')
      .order('data_emprestimo', { ascending: false })

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

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Lista de Empréstimos</h1>
        {carregando ? (
          <p className="text-white text-center font-bold">Carregando...</p>
        ) : emprestimos.length === 0 ? (
          <p className="text-white text-center font-bold">Nenhum empréstimo encontrado.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Livro</th>
                <th className="px-4 py-2 text-white">Solicitante</th>
                <th className="px-4 py-2 text-white">Tipo</th>
                <th className="px-4 py-2 text-white">Data Empréstimo</th>
                <th className="px-4 py-2 text-white">Data Devolução</th>
                <th className="px-4 py-2 text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((e) => (
                <tr key={e.id} className="bg-[#2e8b57] text-white">
                  <td className="border border-[#006400] px-4 py-2">{e.nome_livro}</td>
                  <td className="border border-[#006400] px-4 py-2">{e.nome_solicitante}</td>
                  <td className="border border-[#006400] px-4 py-2 capitalize">{e.tipo_solicitante}</td>
                  <td className="border border-[#006400] px-4 py-2">{e.data_emprestimo}</td>
                  <td className="border border-[#006400] px-4 py-2">{e.data_devolucao}</td>
                  <td className="border border-[#006400] px-4 py-2 font-semibold">
                    {e.devolvido ? 'Devolvido' : 'Pendente'}
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

export default PesqEmprestimos

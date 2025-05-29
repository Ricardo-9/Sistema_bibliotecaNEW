'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    <div>
      <h1>Lista de Empréstimos</h1>
      {carregando ? (
        <p>Carregando...</p>
      ) : emprestimos.length === 0 ? (
        <p>Nenhum empréstimo encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Solicitante</th>
              <th>Tipo</th>
              <th>Data Empréstimo</th>
              <th>Data Devolução</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emprestimos.map((e) => (
              <tr key={e.id}>
                <td>{e.nome_livro}</td>
                <td>{e.nome_solicitante}</td>
                <td>{e.tipo_solicitante}</td>
                <td>{e.data_emprestimo}</td>
                <td>{e.data_devolucao}</td>
                <td>{e.devolvido ? 'Devolvido' : 'Pendente'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default PesqEmprestimos
'use client'
import { withRoleProtection } from '../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, BookOpen, UserCheck } from 'lucide-react'

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
  const router = useRouter()
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
    <div className="min-h-screen bg-[#006400] flex flex-col items-center justify-start px-4 py-10 relative">
      {/* Botão voltar no topo direito */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl bg-[#2e8b57] rounded-[30px] p-8 shadow-2xl z-10 text-white">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <BookOpen className="w-8 h-8" /> Lista de Empréstimos
        </h1>

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
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((e, i) => (
                  <tr
                    key={e.id}
                    className={i % 2 === 0 ? 'bg-[#2e8b57]' : 'bg-[#237e4d]'}
                  >
                    <td className="px-4 py-3 border border-[#006400]">{e.nome_livro}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.nome_solicitante}</td>
                    <td className="px-4 py-3 border border-[#006400] capitalize">{e.tipo_solicitante}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.data_emprestimo}</td>
                    <td className="px-4 py-3 border border-[#006400]">{e.data_devolucao}</td>
                    <td
                      className={`px-4 py-3 border border-[#006400] font-semibold ${
                        e.devolvido ? 'text-green-300' : 'text-yellow-300'
                      }`}
                    >
                      {e.devolvido ? 'Devolvido' : 'Pendente'}
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

export default withRoleProtection(PesqEmprestimos, ['funcionario','funcionario_administrador'])

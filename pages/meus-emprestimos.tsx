'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import { ArrowLeft, BookOpen } from 'lucide-react'

type Livro = {
  nome: string
}

type Emprestimo = {
  id: number
  data_devolucao: string
  livros: Livro[]
}

function MeusEmprestimos() {
  const router = useRouter()
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarEmprestimos() {
      setLoading(true)
      setErro(null)

      try {
        const { data: { user }, error: erroAuth } = await supabase.auth.getUser()

        if (erroAuth || !user) {
          setErro('Erro na autenticação.')
          router.push('/login')
          return
        }

        // Busca o aluno pelo user_id
        const { data: aluno, error: erroAluno } = await supabase
          .from('alunos')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        let usuarioId = aluno?.id ?? null
        let tipo = 'aluno'

        // Se não achou aluno, busca funcionário
        if (!usuarioId) {
          const { data: funcionario, error: erroFuncionario } = await supabase
            .from('funcionarios')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (funcionario?.id) {
            usuarioId = funcionario.id
            tipo = 'funcionario'
          }
        }

        if (!usuarioId) {
          setErro('Usuário não encontrado.')
          setEmprestimos([])
          setLoading(false)
          return
        }

        // Busca os empréstimos relacionados
        const { data, error: erroEmprestimos } = await supabase
          .from('emprestimos')
          .select('id, data_devolucao, livros (nome)')
          .eq('solicitante_id', usuarioId)
          .eq('tipo_solicitante', tipo)
          .is('devolvido', null)
          .order('data_devolucao', { ascending: true })

        if (erroEmprestimos) {
          setErro('Erro ao buscar empréstimos.')
          setEmprestimos([])
        } else if (Array.isArray(data)) {
          // Garante que os dados estejam no formato correto
          const emprestimosFormatados: Emprestimo[] = data.map(item => ({
            id: typeof item.id === 'number' ? item.id : Number(item.id) || 0,
            data_devolucao: item.data_devolucao ?? '',
            livros: Array.isArray(item.livros)
              ? item.livros.map((livro: any) => ({
                  nome: typeof livro.nome === 'string' ? livro.nome : 'Nome não encontrado',
                }))
              : [],
          }))
          setEmprestimos(emprestimosFormatados)
          setErro(null)
        } else {
          setEmprestimos([])
          setErro(null)
        }
      } catch (e) {
        setErro('Erro inesperado ao carregar empréstimos.')
        setEmprestimos([])
      } finally {
        setLoading(false)
      }
    }

    carregarEmprestimos()
  }, [router])

  return (
    <div className="min-h-screen bg-[#006400] flex flex-col items-center justify-start px-4 py-10 relative">
      {/* Botão voltar */}
      <button
        onClick={() => router.push('/perfil')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar para perfil"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Container principal */}
      <div className="w-full max-w-6xl bg-[#2e8b57] rounded-[30px] p-8 shadow-2xl z-10 text-white">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2 drop-shadow">
          <BookOpen className="w-8 h-8" /> Meus Empréstimos
        </h1>

        {loading ? (
          <p className="text-center text-lg font-semibold">Carregando...</p>
        ) : erro ? (
          <p className="text-center text-red-400 font-semibold">{erro}</p>
        ) : emprestimos.length === 0 ? (
          <p className="text-center text-lg font-semibold">Você não possui empréstimos ativos.</p>
        ) : (
          <div className="grid gap-6">
            {emprestimos.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#004d00] rounded-2xl p-6 shadow-md text-white flex flex-col gap-2"
              >
                <p className="text-lg font-semibold">
                  <strong>Livro(s):</strong>{' '}
                  {emp.livros.length > 0
                    ? emp.livros.map((l) => l.nome).join(', ')
                    : 'Nome não encontrado'}
                </p>
                <p className="text-lg font-semibold">
                  <strong>Data para Devolução:</strong>{' '}
                  {emp.data_devolucao
                    ? new Date(emp.data_devolucao).toLocaleDateString('pt-BR')
                    : 'Data não disponível'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(MeusEmprestimos, [
  'aluno',
  'funcionario',
  'funcionario_administrador',
])

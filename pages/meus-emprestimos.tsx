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
  id: string 
  data_devolucao: string
  livro: Livro | null
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
        // Busca usuário autenticado
        const { data: { user }, error: erroAuth } = await supabase.auth.getUser()

        if (erroAuth || !user) {
          setErro('Erro na autenticação.')
          router.push('/login')
          return
        }

        // Busca id de aluno pelo user_id
        const { data: aluno, error: erroAluno } = await supabase
          .from('alunos')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        let usuarioId = aluno?.id ?? null
        let tipo = 'aluno'

        // Se não achar aluno, tenta buscar funcionário
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

        // Busca empréstimos, incluindo dados do livro (objeto único, não array)
        const { data, error: erroEmprestimos } = await supabase
          .from('emprestimos')
          // Seleciona campos de emprestimos e faz inner join para pegar nome do livro
          .select(`
            id,
            data_devolucao,
            livros (
              nome
            )
          `)
          .eq('solicitante_id', usuarioId)
          .eq('tipo_solicitante', tipo)
          .is('devolvido', null)
          .order('data_devolucao', { ascending: true })

        if (erroEmprestimos) {
          setErro('Erro ao buscar empréstimos.')
          setEmprestimos([])
        } else if (Array.isArray(data)) {
          // Mapear dados - livros vem como objeto (não array)
          const emprestimosFormatados: Emprestimo[] = data.map((item: any) => ({
            id: item.id,
            data_devolucao: item.data_devolucao ?? '',
            livro: item.livros ?? null,
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
      <button
        onClick={() => router.push('/perfil')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar para perfil"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
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
                  <strong>Livro:</strong>{' '}
                  {emp.livro ? emp.livro.nome : 'Nome não encontrado'}
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

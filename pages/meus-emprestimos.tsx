'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'

type Emprestimo = {
  id: number
  data_devolucao: string
  livros: {
    nome: string
  }
}

function MeusEmprestimos() {
  const router = useRouter()
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarEmprestimos() {
      const { data: { user }, error: erroAuth } = await supabase.auth.getUser()

      if (erroAuth || !user) {
        setErro('Erro na autenticação.')
        router.push('/login')
        return
      }

      // Buscar o ID e tipo do solicitante
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let usuarioId = aluno?.id
      let tipo = 'aluno'

      if (!usuarioId) {
        const { data: funcionario } = await supabase
          .from('funcionarios')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (funcionario) {
          usuarioId = funcionario.id
          tipo = 'funcionario'
        } else {
          setErro('Usuário não encontrado.')
          return
        }
      }

      const { data, error: erroEmprestimos } = await supabase
        .from('emprestimos')
        .select('id, data_devolucao, livros (nome)')
        .eq('solicitante_id', usuarioId)
        .eq('tipo_solicitante', tipo)
        .is('devolvido', null)
        .order('data_devolucao', { ascending: true })

      if (erroEmprestimos) {
        setErro('Erro ao buscar empréstimos.')
      } else {
        setEmprestimos(data || [])
      }

      setLoading(false)
    }

    carregarEmprestimos()
  }, [])

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10 relative">
      <Image
        src={brasao}
        alt="Brasão"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 w-full max-w-4xl bg-[#2e8b57] text-white rounded-[30px] shadow-2xl px-8 py-12 space-y-8">
        <h1 className="text-4xl font-bold text-center drop-shadow">Meus Empréstimos</h1>

        {loading ? (
          <p className="text-center">Carregando empréstimos...</p>
        ) : erro ? (
          <p className="text-center text-red-400">{erro}</p>
        ) : emprestimos.length === 0 ? (
          <p className="text-center text-white text-lg">Você não possui empréstimos ativos.</p>
        ) : (
          <div className="space-y-6">
            {emprestimos.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#004d00] rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <p><strong>Livro:</strong> {emp.livros?.nome || 'Nome não encontrado'}</p>
                  <p><strong>Data para Devolução:</strong> {new Date(emp.data_devolucao).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <br />
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full bg-white text-black border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
        >
          Voltar
        </button>
        </div>
      </div>
    </div>
  )
}

export default withRoleProtection(MeusEmprestimos, ['aluno', 'funcionario', 'funcionario_administrador'])

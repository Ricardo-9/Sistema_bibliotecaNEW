'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection' 

function CadastroEmprestimos() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome_livro: '',
    nome_pessoa: '',
  })

  const [livrosDisponiveis, setLivrosDisponiveis] = useState<{ id: string; nome: string }[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [dataDevolucaoFormatada, setDataDevolucaoFormatada] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLivros() {
      const { data, error } = await supabase
        .from('livros')
        .select('id, nome')
        .gt('q_disponivel', 0)
        .order('nome')

      if (!error && data) {
        setLivrosDisponiveis(data)
      }
    }

    fetchLivros()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    const livroSelecionado = livrosDisponiveis.find(l => l.id === form.nome_livro)

    if (!livroSelecionado) {
      setMsg('Livro não encontrado')
      return
    }

    const { data: livroDados, error: erroLivro } = await supabase
      .from('livros')
      .select('q_disponivel')
      .eq('id', form.nome_livro)
      .maybeSingle()

    if (erroLivro || !livroDados) {
      setMsg('Erro ao obter dados do livro')
      return
    }

    if (livroDados.q_disponivel <= 0) {
      setMsg('Não há exemplares disponíveis')
      return
    }

    let solicitante_id: string | null = null
    let tipo_solicitante: 'aluno' | 'funcionario' | null = null

    const { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .ilike('nome', form.nome_pessoa)
      .maybeSingle()

    if (aluno) {
      solicitante_id = aluno.id
      tipo_solicitante = 'aluno'
    } else {
      const { data: funcionario } = await supabase
        .from('funcionarios')
        .select('id')
        .ilike('nome', form.nome_pessoa)
        .maybeSingle()

      if (funcionario) {
        solicitante_id = funcionario.id
        tipo_solicitante = 'funcionario'
      }
    }

    if (!solicitante_id || !tipo_solicitante) {
      setMsg('Pessoa não encontrada (aluno ou funcionário)')
      return
    }

    const { data: emprestimoExistente } = await supabase
      .from('emprestimos')
      .select('*')
      .eq('nome_livro', form.nome_livro)
      .eq('solicitante_id', solicitante_id)
      .eq('tipo_solicitante', tipo_solicitante)
      .is('devolvido', null)
      .maybeSingle()

    if (emprestimoExistente) {
      setMsg('Este usuário já possui este livro emprestado.')
      return
    }

    const dataEmprestimo = new Date()
    const dataDevolucao = new Date()
    dataDevolucao.setDate(dataEmprestimo.getDate() + 30)

    const { error: erroInsercao } = await supabase.from('emprestimos').insert([
      {
        nome_livro: form.nome_livro,
        solicitante_id,
        tipo_solicitante,
        data_devolucao: dataDevolucao.toISOString(),
      },
    ])

    if (erroInsercao) {
      setMsg('Erro ao registrar empréstimo')
      return
    }

    const { error: erroAtualizacao } = await supabase
      .from('livros')
      .update({ q_disponivel: livroDados.q_disponivel - 1 })
      .eq('id', form.nome_livro)

    if (erroAtualizacao) {
      setMsg('Erro ao atualizar quantidade de livros')
      return
    }

    setDataDevolucaoFormatada(
      dataDevolucao.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    )

    setMsg('Empréstimo efetuado com sucesso.')
    setForm({ nome_livro: '', nome_pessoa: '' })
  }

  return (
    <div>
      <h1>Cadastro de Empréstimos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome_livro">Nome do Livro: </label>
          <select
            name="nome_livro"
            value={form.nome_livro}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecione um livro
            </option>
            {livrosDisponiveis.map((livro) => (
              <option key={livro.id} value={livro.id}>
                {livro.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nome_pessoa">Nome do Solicitante: </label>
          <input
            type="text"
            name="nome_pessoa"
            value={form.nome_pessoa}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/tela_inicio')}
      >
        Voltar
      </button>

      {msg && <p>{msg}</p>}
      {dataDevolucaoFormatada && (
        <p>
          Data limite para devolução: <strong>{dataDevolucaoFormatada}</strong>
        </p>
      )}
    </div>
  )
}

export default withRoleProtection(CadastroEmprestimos, ['aluno', 'funcionario'])
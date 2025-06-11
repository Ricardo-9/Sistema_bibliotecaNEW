'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png' // Ajuste o caminho se necessário

function CadastroEmprestimos() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome_livro: '',
    nome_pessoa: '',
  })

  const [livrosDisponiveis, setLivrosDisponiveis] = useState<{ id: string; nome: string }[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      } else {
        setError('Erro ao carregar os livros disponíveis')
      }
    }
    fetchLivros()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
    setMsg(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)

    const livroSelecionado = livrosDisponiveis.find(l => String(l.id) === String(form.nome_livro))
    if (!livroSelecionado) {
      setError('Livro não encontrado')
      return
    }

    const { data: livroDados, error: erroLivro } = await supabase
      .from('livros')
      .select('q_disponivel')
      .eq('id', form.nome_livro)
      .maybeSingle()

    if (erroLivro || !livroDados) {
      setError('Erro ao obter dados do livro')
      return
    }

    if (livroDados.q_disponivel <= 0) {
      setError('Não há exemplares disponíveis')
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
      setError('Pessoa não encontrada (aluno ou funcionário)')
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
      setError('Este usuário já possui este livro emprestado.')
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
      setError('Erro ao registrar empréstimo')
      return
    }

    const { error: erroAtualizacao } = await supabase
      .from('livros')
      .update({ q_disponivel: livroDados.q_disponivel - 1 })
      .eq('id', form.nome_livro)

    if (erroAtualizacao) {
      setError('Erro ao atualizar quantidade de livros')
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      <Image
        src={brasao}
        alt="Brasão"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 bg-[#2e8b57] rounded-3xl p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Cadastro de Empréstimos</h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <select
            name="nome_livro"
            id="nome_livro"
            value={form.nome_livro}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
          >
            <option value="" disabled>Selecione um livro</option>
            {livrosDisponiveis.map((livro) => (
              <option key={livro.id} value={livro.id}>{livro.nome}</option>
            ))}
          </select>

          <input
            type="text"
            name="nome_pessoa"
            id="nome_pessoa"
            value={form.nome_pessoa}
            onChange={handleChange}
            required
            placeholder="Digite o nome do aluno ou funcionário"
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            autoComplete="off"
          />

          <button
            type="submit"
            className="w-full bg-[#006400] text-white font-bold py-4 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg"
          >
            Cadastrar
          </button>
        </form>

        
        <br></br>
        <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
            >
              Voltar
            </button>

        {dataDevolucaoFormatada && (
          <p className="mt-4 text-center text-white font-medium">
            Data limite para devolução: <strong>{dataDevolucaoFormatada}</strong>
          </p>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(CadastroEmprestimos, ['aluno', 'funcionario', 'funcionario_administrador'])

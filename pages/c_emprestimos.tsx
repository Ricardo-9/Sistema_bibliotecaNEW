'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection' 

function CadastroEmprestimos() {
  const [form, setForm] = useState({
    nome_livro: '',
    nome_pessoa: '',
  })

  const [msg, setMsg] = useState<string | null>(null)
  const [dataDevolucaoFormatada, setDataDevolucaoFormatada] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    const { data: livro, error: erroLivro } = await supabase
      .from('livros')
      .select('id, q_disponivel')
      .ilike('nome', form.nome_livro)
      .maybeSingle()

    if (erroLivro || !livro) {
      setMsg('Livro não cadastrado')
      return
    }

    if (livro.q_disponivel <= 0) {
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
      .eq('nome_livro', livro.id)
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
        nome_livro: livro.id,
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
      .update({ q_disponivel: livro.q_disponivel - 1 })
      .eq('id', livro.id)

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
          <input
            type="text"
            name="nome_livro"
            value={form.nome_livro}
            onChange={handleChange}
            required
          />
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
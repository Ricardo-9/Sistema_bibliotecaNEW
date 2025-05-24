'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

function DevolucaoLivros() {
  const [form, setForm] = useState({
    nome_livro: '',
    nome_pessoa: '',
  })

  const [msg, setMsg] = useState<string | null>(null)

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
      setMsg('Livro não encontrado')
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
      setMsg('Usuário não encontrado')
      return
    }

    const { data: emprestimo, error: erroEmprestimo } = await supabase
      .from('emprestimos')
      .select('id, nome_livro, solicitante_id')
      .eq('nome_livro', livro.id)
      .eq('solicitante_id', solicitante_id)
      .eq('tipo_solicitante', tipo_solicitante)
      .is('devolvido', null)
      .maybeSingle()

    if (erroEmprestimo || !emprestimo) {
      setMsg('Empréstimo não encontrado para este livro e usuário')
      return
    }

     const { error: erroRemocao } = await supabase
      .from('emprestimos')
      .delete()
      .eq('id', emprestimo.id)

    if (erroRemocao) {
      setMsg('Ocorreu um erro ao remover o empréstimo')
      return
    }

    const { error: erroAtualizacaoLivro } = await supabase
      .from('livros')
      .update({ q_disponivel: livro.q_disponivel + 1 })
      .eq('id', livro.id)

    if (erroAtualizacaoLivro) {
      setMsg('Erro ao atualizar quantidade de livros')
      return
    }

    setMsg('Devolução registrada com sucesso.')
    setForm({ nome_livro: '', nome_pessoa: '' })
  }

  return (
    <div>
      <h1>Devolução de Livros</h1>
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
        <div>
          <button type="submit">Registrar Devolução</button>
        </div>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  )
}


export default withRoleProtection(DevolucaoLivros, ['funcionario'])
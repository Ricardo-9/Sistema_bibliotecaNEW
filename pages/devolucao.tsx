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

    const { data: livro, error: erroLivro } = await supabase
      .from('livros')
      .select('id, q_disponivel')
      .ilike('nome', form.nome_livro)
      .maybeSingle()

    const { data: usuario, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('id')
      .ilike('nome', form.nome_pessoa)
      .maybeSingle()

    if (erroLivro || !livro || erroUsuario || !usuario) {
      setMsg('Livro ou usuário não encontrados')
      return
    }

    const { data: emprestimo, error: erroEmprestimo } = await supabase
      .from('emprestimos')
      .select('id, nome_livro, nome_pessoa')
      .eq('nome_livro', livro.id)
      .eq('nome_pessoa', usuario.id)
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

    const { error: erroAtualizacao } = await supabase
      .from('livros')
      .update({ q_disponivel: livro.q_disponivel + 1 })
      .eq('id', livro.id)

    if (erroAtualizacao) {
      setMsg('Ocorreu um erro ao atualizar a quantidade de livros.')
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
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'

export default function EditarLivro() {
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '',
    ano_publicacao: '',
    categoria: '',
    isbn: '',
    autor: '',
    q_disponivel: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    const fetchLivro = async () => {
      const { data, error } = await supabase
        .from('livros')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Erro ao buscar livro')
        return
      }

      if (data) {
        setForm({
          nome: data.nome,
          ano_publicacao: data.ano_publicacao,
          categoria: data.categoria,
          isbn: data.isbn,
          autor: data.autor,
          q_disponivel: data.q_disponivel
        })
      }
    }

    fetchLivro()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: duplicada, error: erroBusca } = await supabase
      .from('livros')
      .select('*')
      .eq('isbn', form.isbn)
      .neq('id', id)

    if (erroBusca) {
      alert('Erro ao verificar duplicidade')
      return
    }

    if (duplicada && duplicada.length > 0) {
      alert('Já existe um livro com esse ISBN.')
      return
    }

    const { error } = await supabase
      .from('livros')
      .update({
        nome: form.nome,
        ano_publicacao: form.ano_publicacao,
        categoria: form.categoria,
        isbn: form.isbn,
        autor: form.autor,
        q_disponivel: form.q_disponivel
      })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar')
    } else {
      router.push('/pesq_livros')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Editar Livro</h1>

      <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" />
      <input name="ano_publicacao" value={form.ano_publicacao} onChange={handleChange} placeholder="Ano de Publicação" />
      <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoria" />
      <input name="autor" value={form.autor} onChange={handleChange} placeholder="Autor" />
      <input name="q_disponivel" value={form.q_disponivel} onChange={handleChange} placeholder="Quantidade Disponível" />
      <Cleave name="isbn" value={form.isbn} onChange={handleChange} options={{delimiters: ['-', '-', '-', '-'], blocks: [3, 1, 2, 6, 1], numericOnly: true}}/>
      <button type="submit">Salvar</button>
    </form>
  )
}

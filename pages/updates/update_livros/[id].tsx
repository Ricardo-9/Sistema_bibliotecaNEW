'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'

function EditarLivro() {
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

  // Normaliza nome para comparar (trim, lowercase, espaços únicos)
  function normalizarNome(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  // Remove tudo que não é dígito
  function limparNumero(str: string) {
    return str.replace(/\D/g, '')
  }

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
          q_disponivel: String(data.q_disponivel)
        })
      }
    }

    fetchLivro()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nomeNormalizado = normalizarNome(form.nome)
    const isbnLimpo = limparNumero(form.isbn)
    const quantidade = Number(form.q_disponivel)

    // Validações básicas
    if (!nomeNormalizado) {
      alert('O nome do livro é obrigatório.')
      return
    }

    if (!isbnLimpo || (isbnLimpo.length !== 13 && isbnLimpo.length !== 10)) {
      alert('O ISBN deve conter 10 ou 13 dígitos numéricos.')
      return
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      alert('A quantidade disponível deve ser um número inteiro positivo.')
      return
    }

    // Buscar todos os livros exceto o atual para validar duplicidade de nome
    const { data: livros, error: erroBuscaNome } = await supabase
      .from('livros')
      .select('id, nome, isbn')
      .neq('id', id)

    if (erroBuscaNome) {
      alert('Erro ao verificar duplicidade do nome')
      return
    }

    // Verificar duplicidade do nome
    const nomeDuplicado = livros?.some(l =>
      normalizarNome(l.nome) === nomeNormalizado
    )
    if (nomeDuplicado) {
      alert('Já existe um livro com esse nome.')
      return
    }

    // Verificar duplicidade do ISBN
    const isbnDuplicado = livros?.some(l => limparNumero(l.isbn) === isbnLimpo)
    if (isbnDuplicado) {
      alert('Já existe um livro com esse ISBN.')
      return
    }

    const { error } = await supabase
      .from('livros')
      .update({
        nome: form.nome.trim(),
        ano_publicacao: form.ano_publicacao.trim(),
        categoria: form.categoria.trim(),
        isbn: form.isbn.trim(),
        autor: form.autor.trim(),
        q_disponivel: quantidade
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

      <input
        name="nome"
        value={form.nome}
        onChange={handleChange}
        placeholder="Nome"
        required
      />
      <input
        name="ano_publicacao"
        value={form.ano_publicacao}
        onChange={handleChange}
        placeholder="Ano de Publicação"
      />
      <input
        name="categoria"
        value={form.categoria}
        onChange={handleChange}
        placeholder="Categoria"
      />
      <input
        name="autor"
        value={form.autor}
        onChange={handleChange}
        placeholder="Autor"
      />
      <input
        name="q_disponivel"
        value={form.q_disponivel}
        onChange={handleChange}
        placeholder="Quantidade Disponível"
        type="number"
        min="0"
      />
      <Cleave
        name="isbn"
        value={form.isbn}
        onChange={handleChange}
        options={{ delimiters: ['-', '-', '-', '-'], blocks: [3, 1, 2, 6, 1], numericOnly: true }}
        placeholder="ISBN"
        required
      />
      <button type="submit">Salvar</button>
    </form>
  )
}

// Protege para que somente usuários com role 'funcionario' acessem
export default withRoleProtection(EditarLivro, ['funcionario'])
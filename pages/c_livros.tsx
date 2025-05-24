'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'

export default function CadastroLivros() {
  const [form, setForm] = useState({
    nome: '',
    ano_publicacao: '',
    categoria: '',
    isbn: '',
    autor: '',
    q_disponivel: ''
  })

  const [mensagem, setMensagem] = useState('')

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }
  function handleIsbnChange(e: any) {
    setForm({ ...form, isbn: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const camposVazios = Object.entries(form).filter(([chave, valor]) => valor.trim() === '')
    if (camposVazios.length > 0) {
      setMensagem('Por favor, preencha todos os campos.')
      return
    }

    const { data: livrosExistentes, error: fetchError } = await supabase
      .from('livros')
      .select('isbn')
      .eq('isbn', form.isbn)

    if (fetchError) {
      setMensagem('Erro ao verificar ISBN existente: ' + fetchError.message)
      return
    }

    if (livrosExistentes.length > 0) {
      setMensagem('Já existe um livro com esse ISBN cadastrado.')
      return
    }

    const isbnLimpo = form.isbn.replace(/[^0-9]/g, '')
    if (isbnLimpo.length !== 13) {
      setMensagem('O campo ISBN deve estar completamente preenchido.')
      return
    }

    const ano = parseInt(form.ano_publicacao, 10)
    const anoAtual = new Date().getFullYear()
    if (isNaN(ano) || ano < 1000 || ano > anoAtual) {
      setMensagem(`Ano de publicação inválido. Digite um ano entre 1000 e ${anoAtual}.`)
      return
    }

    const quantidade = parseInt(form.q_disponivel, 10)
    if (isNaN(quantidade) || quantidade < 0) {
      setMensagem('Quantidade deve ser um número inteiro não negativo.')
      return
    }

    const { error } = await supabase.from('livros').insert([form])

    if (error) {
      setMensagem('Erro ao cadastrar livro: ' + error.message)
    } else {
      setMensagem('Livro cadastrado com sucesso!')
      setForm({
        nome: '',
        ano_publicacao: '',
        categoria: '',
        isbn: '',
        autor: '',
        q_disponivel: ''
      })
    }
  }

  return (
    <div>
      <h1>Cadastro de Livros</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} />
        </div>

        <div>
          <label>Ano de Publicação</label>
          <input
            name="ano_publicacao"
            value={form.ano_publicacao}
            onChange={handleChange}
            type="number"
            min={1000}
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label>Categoria</label>
          <input name="categoria" value={form.categoria} onChange={handleChange}/>
        </div>

        <div>
          <label>ISBN</label>
          <Cleave
            name="isbn"
            value={form.isbn}
            onChange={handleIsbnChange}
            options={{
              delimiters: ['-', '-', '-', '-'],
              blocks: [3, 1, 2, 6, 1],
              numericOnly: true
            }}
          />
        </div>

        <div>
          <label>Autor</label>
          <input name="autor" value={form.autor} onChange={handleChange} />
        </div>

        <div>
          <label>Quantidade</label>
          <input
            name="q_disponivel"
            value={form.q_disponivel}
            onChange={handleChange}
            type="number"
            min={0}
          
          />
        </div>

        <button type="submit" className='border-2'>
          Cadastrar
        </button>
      </form>

      {mensagem && <p>{mensagem}</p>}
    </div>
  )
}
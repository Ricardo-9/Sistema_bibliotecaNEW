'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png' // ajuste o caminho conforme sua estrutura
import { withRoleProtection } from '../components/withRoleProtection'

function CadastroLivros() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: '',
    ano_publicacao: '',
    categoria: '',
    isbn: '',
    autor: '',
    q_disponivel: '',
    editora: ''
  })

  const [mensagem, setMensagem] = useState('')
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    setMensagem('')
    setError('')
  }

  function handleIsbnChange(e: any) {
    setForm({ ...form, isbn: e.target.value })
    setMensagem('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setMensagem('')
    setError('')

    const { data: livrosExistentes, error: fetchError } = await supabase
      .from('livros')
      .select('isbn')
      .eq('isbn', form.isbn)

    if (fetchError) {
      setError('Erro ao verificar ISBN existente: ' + fetchError.message)
      return
    }

    if (livrosExistentes.length > 0) {
      setError('Já existe um livro com esse ISBN cadastrado.')
      return
    }

    const isbnLimpo = form.isbn.replace(/[^0-9]/g, '')
    if (isbnLimpo.length !== 13) {
      setError('O campo ISBN deve estar completamente preenchido.')
      return
    }

    const ano = parseInt(form.ano_publicacao, 10)
    const anoAtual = new Date().getFullYear()
    if (isNaN(ano) || ano < 1000 || ano > anoAtual) {
      setError(`Ano de publicação inválido. Digite um ano entre 1000 e ${anoAtual}.`)
      return
    }

    const quantidade = parseInt(form.q_disponivel, 10)
    if (isNaN(quantidade) || quantidade < 0) {
      setError('Quantidade deve ser um número inteiro não negativo.')
      return
    }

    const { data: editoras, error: fetchEditoraError } = await supabase
      .from('editoras')
      .select('nome')
      .eq('nome', form.editora)
      .limit(1)

    if (fetchEditoraError) {
      setError('Erro ao verificar editora: ' + fetchEditoraError.message)
      return
    }

    if (!editoras || editoras.length === 0) {
      setError('Editora não cadastrada')
      return
    }

    const { error } = await supabase.from('livros').insert([form])

    if (error) {
      setError('Erro ao cadastrar livro: ' + error.message)
    } else {
      setMensagem('Livro cadastrado com sucesso!')
      setForm({
        nome: '',
        ano_publicacao: '',
        categoria: '',
        isbn: '',
        autor: '',
        q_disponivel: '',
        editora: ''
      })
    }
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Cadastro de Livros</h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="nome"
            placeholder="Nome do livro"
            required
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="number"
            min={1000}
            max={new Date().getFullYear()}
            name="ano_publicacao"
            placeholder="Ano da publicação"
            required
            value={form.ano_publicacao}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="categoria"
            placeholder="Categoria do livro"
            required
            value={form.categoria}
            onChange={handleChange}
            autoComplete="off"
          />
          <Cleave
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            name="isbn"
            placeholder="000-0-00-000000-0"
            value={form.isbn}
            onChange={handleIsbnChange}
            options={{
              delimiters: ['-', '-', '-', '-'],
              blocks: [3, 1, 2, 6, 1],
              numericOnly: true,
            }}
            required
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="autor"
            placeholder="Nome do autor"
            required
            value={form.autor}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="number"
            min={0}
            name="q_disponivel"
            placeholder="Quantidade disponível"
            required
            value={form.q_disponivel}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="editora"
            placeholder="Nome da editora"
            required
            value={form.editora}
            onChange={handleChange}
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
      </div>
    </div>
  )
}

export default withRoleProtection(CadastroLivros, ['funcionario', 'funcionario_administrador'])

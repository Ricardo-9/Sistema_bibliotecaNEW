'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import { Book, ArrowLeft } from 'lucide-react'
import brasao from './imgs/Bc.png.png'
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

  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
    setMsg('')
  }

  function handleIsbnChange(e: any) {
    setForm(prev => ({ ...prev, isbn: e.target.value }))
    setError('')
    setMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMsg('')

    // Verifica ISBN duplicado
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

    // Validação ISBN (13 dígitos)
    const isbnLimpo = form.isbn.replace(/[^0-9]/g, '')
    if (isbnLimpo.length !== 13) {
      setError('O campo ISBN deve estar completamente preenchido.')
      return
    }

    // Validação ano de publicação
    const ano = parseInt(form.ano_publicacao, 10)
    const anoAtual = new Date().getFullYear()
    if (isNaN(ano) || ano < 1000 || ano > anoAtual) {
      setError(`Ano de publicação inválido. Digite um ano entre 1000 e ${anoAtual}.`)
      return
    }

    // Validação quantidade disponível
    const quantidade = parseInt(form.q_disponivel, 10)
    if (isNaN(quantidade) || quantidade < 0) {
      setError('Quantidade deve ser um número inteiro não negativo.')
      return
    }

    // Verifica se editora existe
    const { data: editoras, error: fetchEditoraError } = await supabase
      .from('editoras')
      .select('nome')
      .eq('nome', form.editora.trim())
      .limit(1)

    if (fetchEditoraError) {
      setError('Erro ao verificar editora: ' + fetchEditoraError.message)
      return
    }

    if (!editoras || editoras.length === 0) {
      setError('Editora não cadastrada.')
      return
    }

    // Insere livro
    const { error } = await supabase.from('livros').insert([
      {
        nome: form.nome.trim(),
        ano_publicacao: form.ano_publicacao.trim(),
        categoria: form.categoria.trim(),
        isbn: form.isbn.trim(),
        autor: form.autor.trim(),
        q_disponivel: quantidade,
        editora: form.editora.trim()
      }
    ])

    if (error) {
      setError('Erro ao cadastrar livro: ' + error.message)
    } else {
      setMsg('Livro cadastrado com sucesso!')
      setForm({
        nome: '',
        ano_publicacao: '',
        categoria: '',
        isbn: '',
        autor: '',
        q_disponivel: '',
        editora: ''
      })
      // Redireciona após 1.5s, se quiser
      // setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      

      {/* Botões de topo */}
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <Book className="w-8 h-8" /> Cadastro de Livros
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="nome"
            placeholder="Nome do livro"
            required
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
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
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="categoria"
            placeholder="Categoria do livro"
            required
            value={form.categoria}
            onChange={handleChange}
            autoComplete="off"
          />
          <Cleave
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
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
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="autor"
            placeholder="Nome do autor"
            required
            value={form.autor}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
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
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
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
            className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default withRoleProtection(CadastroLivros, ['funcionario', 'funcionario_administrador'])

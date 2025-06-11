'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { withRoleProtection } from '../../../components/withRoleProtection'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png' // ajuste o caminho conforme seu projeto

function EditarLivro() {
  const router = useRouter()
  const { id } = useParams()

  const [form, setForm] = useState({
    nome: '',
    ano_publicacao: '',
    categoria: '',
    isbn: '',
    autor: '',
    q_disponivel: ''
  })
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const fetchLivro = async () => {
      const { data, error } = await supabase
        .from('livros')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setErro('Erro ao buscar livro')
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

  const normalizarNome = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ')
  const limparNumero = (str: string) => str.replace(/\D/g, '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    const nomeNormalizado = normalizarNome(form.nome)
    const isbnLimpo = limparNumero(form.isbn)
    const quantidade = Number(form.q_disponivel)
    const ano = Number(form.ano_publicacao)
    const anoAtual = new Date().getFullYear()

    if (!nomeNormalizado) {
      setErro('O nome do livro é obrigatório.')
      return
    }
    if (!isbnLimpo || (isbnLimpo.length !== 10 && isbnLimpo.length !== 13)) {
      setErro('O ISBN deve conter 10 ou 13 dígitos numéricos.')
      return
    }
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      setErro('A quantidade disponível deve ser um número inteiro positivo.')
      return
    }
    if (!form.ano_publicacao || isNaN(ano) || ano < 0 || ano > anoAtual) {
      setErro(`O ano de publicação deve ser um número válido entre 0 e ${anoAtual}.`)
      return
    }

    // Verifica duplicidade de nome e ISBN ignorando o próprio livro
    const { data: livros, error: erroBusca } = await supabase
      .from('livros')
      .select('id, nome, isbn')
      .neq('id', id)

    if (erroBusca) {
      setErro('Erro ao verificar duplicidade')
      return
    }

    if (livros?.some(l => normalizarNome(l.nome) === nomeNormalizado)) {
      setErro('Já existe um livro com esse nome.')
      return
    }
    if (livros?.some(l => limparNumero(l.isbn) === isbnLimpo)) {
      setErro('Já existe um livro com esse ISBN.')
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
      setErro('Erro ao atualizar livro: ' + error.message)
    } else {
      setMensagem('Livro atualizado com sucesso!')
      setTimeout(() => router.push('/pesq_livros'), 2000)
    }
  }

  if (erro && !form.nome) return <p className="p-4 text-white">Carregando...</p>

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      <Image
        src={brasao}
        alt="Brasão"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 bg-[#2e8b57] rounded-3xl p-8 sm:p-12 max-w-2xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Editar Livro</h1>

        {erro && <p className="text-red-300 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-300 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSalvar} className="space-y-4">
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="Ano de Publicação"
            name="ano_publicacao"
            value={form.ano_publicacao}
            onChange={handleChange}
            type="number"
            min={0}
            max={new Date().getFullYear()}
            required
          />
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          />
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="Autor"
            name="autor"
            value={form.autor}
            onChange={handleChange}
          />
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="Quantidade Disponível"
            name="q_disponivel"
            value={form.q_disponivel}
            onChange={handleChange}
            type="number"
            min={0}
            required
          />
          <input
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            placeholder="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-[#006400] text-white font-bold py-3 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg"
          >
            Salvar alterações
          </button>
        </form>
        <br></br>
        <button
              type="button"
              onClick={() => router.push('/pesq_livross')}
              className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
            >
              Voltar
            </button>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarLivro, ['funcionario', 'funcionario_administrador'])

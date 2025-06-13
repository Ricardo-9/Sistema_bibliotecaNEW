'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { withRoleProtection } from '../../../components/withRoleProtection'
import Image from 'next/image'
import { ArrowLeft, BookCheck } from 'lucide-react'
import brasao from '../../imgs/Bc.png.png'

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

  const normalizarNome = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ')
  const limparNumero = (str) => str.replace(/\D/g, '')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    const nomeNormalizado = normalizarNome(form.nome)
    const isbnLimpo = limparNumero(form.isbn)
    const quantidade = Number(form.q_disponivel)
    const ano = Number(form.ano_publicacao)
    const anoAtual = new Date().getFullYear()

    if (!nomeNormalizado) return setErro('O nome do livro é obrigatório.')
    if (!isbnLimpo || (isbnLimpo.length !== 10 && isbnLimpo.length !== 13))
      return setErro('O ISBN deve conter 10 ou 13 dígitos numéricos.')
    if (!Number.isInteger(quantidade) || quantidade < 0)
      return setErro('A quantidade disponível deve ser um número inteiro positivo.')
    if (!form.ano_publicacao || isNaN(ano) || ano < 0 || ano > anoAtual)
      return setErro(`O ano de publicação deve ser um número válido entre 0 e ${anoAtual}.`)

    const { data: livros, error: erroBusca } = await supabase
      .from('livros')
      .select('id, nome, isbn')
      .neq('id', id)

    if (erroBusca) return setErro('Erro ao verificar duplicidade')

    if (livros?.some(l => normalizarNome(l.nome) === nomeNormalizado))
      return setErro('Já existe um livro com esse nome.')

    if (livros?.some(l => limparNumero(l.isbn) === isbnLimpo))
      return setErro('Já existe um livro com esse ISBN.')

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

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      

      <button
        onClick={() => router.push('/pesq_livros')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <BookCheck className="w-8 h-8" /> Editar Livro
        </h1>

        {erro && <p className="text-red-400 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSalvar} className="space-y-5">
          {[{ name: 'nome', placeholder: 'Nome' },
            { name: 'ano_publicacao', placeholder: 'Ano de Publicação', type: 'number' },
            { name: 'categoria', placeholder: 'Categoria' },
            { name: 'autor', placeholder: 'Autor' },
            { name: 'q_disponivel', placeholder: 'Quantidade Disponível', type: 'number' },
            { name: 'isbn', placeholder: 'ISBN' }].map(({ name, placeholder, type }) => (
            <input
              key={name}
              name={name}
              type={type || 'text'}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            />
          ))}

          <button
            type="submit"
            className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarLivro, ['funcionario', 'funcionario_administrador'])
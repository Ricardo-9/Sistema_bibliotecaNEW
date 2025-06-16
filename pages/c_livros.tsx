import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, BookPlus } from 'lucide-react'
import { withRoleProtection } from '../components/withRoleProtection'
import Cleave from 'cleave.js/react'

interface Editora {
  id: string
  nome: string
}

function CadastroLivros() {
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '',
    autor: '',
    ano_publicacao: '',
    categoria: '',
    editora: '',
    isbn: '',
    q_disponivel: '',
  })

  const [editoras, setEditoras] = useState<Editora[]>([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchEditoras() {
      const { data, error } = await supabase
        .from('editoras')
        .select('id, nome')
        .order('nome', { ascending: true })

      if (data) setEditoras(data)
      else console.error('Erro ao buscar editoras:', error)
    }

    fetchEditoras()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
    setMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMsg('')

    if (!form.editora) {
      setError('Selecione uma editora válida.')
      return
    }

    if(parseInt(form.q_disponivel) < 0){
      setError('A quantidade de livros deve ser um inteiro positivo')
      return
    }

    const { error } = await supabase.from('livros').insert([{
      nome: form.nome.trim(),
      autor: form.autor.trim(),
      ano_publicacao: parseInt(form.ano_publicacao),
      categoria: form.categoria.trim(),
      editora: form.editora,
      isbn: form.isbn,
      q_disponivel: form.q_disponivel,
    }])

    

    if (error) {
      setError('Erro ao cadastrar o livro: ' + error.message)
    } else {
      setMsg('Livro cadastrado com sucesso!')
      setForm({ nome: '', autor: '', ano_publicacao: '', categoria: '', editora: '', isbn: '', q_disponivel: ''})
      setTimeout(() => router.push('/dashboard'), 1500)
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
          <BookPlus className="w-8 h-8" /> Cadastro de Livros
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="nome"
            placeholder="Título"
            required
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="autor"
            placeholder="Autor"
            required
            value={form.autor}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="number"
            name="ano_publicacao"
            placeholder="Ano de Publicação"
            required
            value={form.ano_publicacao}
            onChange={handleChange}
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="categoria"
            placeholder="Gênero"
            required
            value={form.categoria}
            onChange={handleChange}
            autoComplete="off"
          />

          <select
            name="editora"
            value={form.editora}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold bg-white"
          >
            <option value="">Selecione a editora</option>
            {editoras.map((editora) => (
              <option key={editora.id} value={editora.id}>
                {editora.nome}
              </option>
            ))}
          </select>

          <Cleave
            className="w-full p-4 rounded-full font-semibold text-emerald-900 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-800/30"
            name="isbn"
            placeholder="ISBN"
            value={form.isbn}
            onChange={handleChange}
            options={{
              delimiters: ['-', '-', '-', '-', '-'],
              blocks: [3, 2, 5, 2, 1],
              numericOnly: true,
            }}
            required
          />

          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="number"
            name="q_disponivel"
            placeholder="Quantidade disponível"
            required
            value={form.q_disponivel}
            onChange={handleChange}
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


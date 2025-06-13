'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import {
  Search,
  PlusCircle,
  Trash2,
  Pencil,
  Book,
  ArrowLeft
} from 'lucide-react'

type Livros = {
  id: string
  nome: string
  ano_publicacao: string
  categoria: string
  autor: string
  q_disponivel: string
  isbn: string
}

type Props = {
  role: string
}

function PesLivros({ role }: Props) {
    const [usuario, setUsuario] = useState<{ id: string, tipo: 'aluno' | 'funcionario' | 'funcionario_administrador' } | null>(null)
  const router = useRouter()
  const [livros, setLivros] = useState<Livros[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchLivros = async (nomeFiltro?: string) => {
    setCarregando(true)
    let query = supabase.from('livros').select('*').order('created_at', { ascending: false })

    if (nomeFiltro && nomeFiltro.trim() !== '') {
      query = query.ilike('nome', `%${nomeFiltro}%`)
    }

    const { data, error } = await query
    setCarregando(false)

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setLivros(data || [])
    }
  }

  useEffect(() => {
    fetchLivros()
  }, [])

  const deleteLivro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return
    await supabase.from('livros').delete().eq('id', id)
    fetchLivros(filtroNome)
  }

  const handlePesquisar = () => {
    fetchLivros(filtroNome)
  }

  
  
  return (
    <div className="min-h-screen bg-[#006400] flex flex-col items-center justify-start px-4 py-10 relative">
      {/* Botão voltar */}
      <button
        onClick={() => router.push('/painel_aluno')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl bg-[#2e8b57] rounded-[30px] p-8 shadow-2xl z-10 text-white">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2 drop-shadow">
          <Book className="w-8 h-8" /> Pesquisa de Livros
        </h1>

        {/* Filtro e botões */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome do livro..."
            className="w-full md:w-2/3 px-6 py-3 rounded-full bg-[#006400] text-white font-medium placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition"
            aria-label="Filtro por nome do livro"
          />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handlePesquisar}
              className="flex items-center gap-2 bg-white text-[#006400] font-semibold px-5 py-3 rounded-full hover:bg-emerald-100 transition shadow-md"
            >
              <Search className="w-5 h-5" /> Pesquisar
            </button>
            {role === 'funcionario_administrador' && (
              <button
                onClick={() => router.push('/c_livros')}
                className="flex items-center gap-2 bg-white text-[#006400] font-semibold px-5 py-3 rounded-full hover:bg-emerald-100 transition shadow-md"
              >
                <PlusCircle className="w-5 h-5" /> Cadastrar Livro
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo da tabela */}
        {carregando ? (
          <p className="text-center text-lg font-semibold">Carregando...</p>
        ) : livros.length === 0 ? (
          <p className="text-center text-lg font-semibold">Nenhum livro encontrado.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-inner border border-[#1f6f43]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f6f43] text-white text-sm sm:text-base select-none">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Ano</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3">Disponível</th>
                  <th className="px-4 py-3">ISBN</th>
                  {role === 'funcionario_administrador' && (
                    <th className="px-4 py-3 text-center">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {livros.map((livro) => (
                  <tr
                    key={livro.id}
                    className="odd:bg-[#2e8b57] even:bg-[#237e4d] text-white"
                  >
                    <td className="px-4 py-3 border border-[#006400]">{livro.nome}</td>
                    <td className="px-4 py-3 border border-[#006400]">{livro.ano_publicacao}</td>
                    <td className="px-4 py-3 border border-[#006400]">{livro.categoria}</td>
                    <td className="px-4 py-3 border border-[#006400]">{livro.autor}</td>
                    <td className="px-4 py-3 border border-[#006400]">{livro.q_disponivel}</td>
                    <td className="px-4 py-3 border border-[#006400]">{livro.isbn}</td>
                    {role === 'funcionario_administrador' && (
                      <td className="px-4 py-3 border border-[#006400] text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => deleteLivro(livro.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1 shadow-sm transition"
                            aria-label={`Excluir livro ${livro.nome}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/updates/update_livros/${livro.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1 shadow-sm transition"
                            aria-label={`Editar livro ${livro.nome}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(PesLivros, ['aluno', 'funcionario', 'funcionario_administrador'])

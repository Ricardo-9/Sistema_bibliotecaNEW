'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

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
    await supabase.from('livros').delete().eq('id', id)
    fetchLivros(filtroNome)
  }

  const handlePesquisar = () => {
    fetchLivros(filtroNome)
  }

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome do livro"
            className="p-3 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-16 w-3/5 text-white font-bold"
          />
          <button
            onClick={handlePesquisar}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Pesquisar
          </button>
          <button
            onClick={() => router.push('/c_livros')}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Cadastrar Livro
          </button>
        </div>

        {carregando ? (
          <p className="text-white font-bold">Carregando...</p>
        ) : livros.length === 0 ? (
          <p className="text-white font-bold">Nenhum livro encontrado.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Nome</th>
                <th className="px-4 py-2 text-white">Ano de Publicação</th>
                <th className="px-4 py-2 text-white">Categoria</th>
                <th className="px-4 py-2 text-white">Autor</th>
                <th className="px-4 py-2 text-white">Qtd. Disponível</th>
                <th className="px-4 py-2 text-white">ISBN</th>
                {role === 'funcionario_administrador' && <th className="px-4 py-2 text-white">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {livros.map((livro) => (
                <tr key={livro.id} className="bg-[#2e8b57] text-white">
                  <td className="border border-[#006400] px-4 py-2">{livro.nome}</td>
                  <td className="border border-[#006400] px-4 py-2">{livro.ano_publicacao}</td>
                  <td className="border border-[#006400] px-4 py-2">{livro.categoria}</td>
                  <td className="border border-[#006400] px-4 py-2">{livro.autor}</td>
                  <td className="border border-[#006400] px-4 py-2">{livro.q_disponivel}</td>
                  <td className="border border-[#006400] px-4 py-2">{livro.isbn}</td>
                  {role === 'funcionario_administrador' && (
                    <td className="border border-[#006400] px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => deleteLivro(livro.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => router.push(`/updates/update_livros/${livro.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Acesso permitido para alunos e funcionários
export default withRoleProtection(PesLivros, ['aluno', 'funcionario', 'funcionario_administrador'])

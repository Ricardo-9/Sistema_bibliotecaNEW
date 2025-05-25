'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

type Livros = {
  id: string
  nome: string
  ano_publicacao: string
  categoria: string
  autor: string
  q_disponivel: string
  isbn: string
}

export default function PesLivros() {
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
      setLivros(data)
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
    <div>
      <h1>Pesquisar Livros</h1>

      <div>
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Digite o nome do livro"
        />
        <button onClick={handlePesquisar}>
          Pesquisar
        </button>
        <button onClick={() => router.push('/c_livros')}>Cadastrar livro</button>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : livros.length === 0 ? (
        <p>Nenhum livro encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano de Publicação</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Quantidade Disponível</th>
              <th>ISBN</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {livros.map((livro) => (
              <tr key={livro.id}>
                <td>{livro.nome}</td>
                <td>{livro.ano_publicacao}</td>
                <td>{livro.categoria}</td>
                <td>{livro.autor}</td>
                <td>{livro.q_disponivel}</td>
                <td>{livro.isbn}</td>
                <td>
                  <button
                    onClick={() => deleteLivro(livro.id)}>
                    Excluir
                  </button>
                  <button onClick={() => router.push(`/updates/update_livros/${livro.id}`)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

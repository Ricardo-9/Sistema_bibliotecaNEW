'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Editoras = {
  id: string
  nome: string
  email: string
  telefone: string
}

export default function PesqEditoras() {
  const [editoras, setEditoras] = useState<Editoras[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchEditoras = async (nomeFiltro?: string) => {
    setCarregando(true)

    let query = supabase.from('editoras').select('*').order('created_at', { ascending: false })

    if (nomeFiltro && nomeFiltro.trim() !== '') {
      query = query.ilike('nome', `%${nomeFiltro}%`)
    }

    const { data, error } = await query
    setCarregando(false)

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setEditoras(data)
    }
  }

  useEffect(() => {
    fetchEditoras()
  }, [])

  const deleteEditora = async (id: string) => {
    await supabase.from('editoras').delete().eq('id', id)
    fetchEditoras(filtroNome)
  }

  const handlePesquisar = () => {
    fetchEditoras(filtroNome)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pesquisar Editoras</h1>

      <div className="mb-4 space-x-2">
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Digite o nome da editora"
          className="border p-2 rounded w-64"
        />
        <button onClick={handlePesquisar} className="bg-blue-500 text-white px-4 py-2 rounded">
          Pesquisar
        </button>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : editoras.length === 0 ? (
        <p className="text-red-500">Nenhuma editora encontrada.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border-b">Nome</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Telefone</th>
              <th className="p-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {editoras.map((editora) => (
              <tr key={editora.id}>
                <td className="p-2 border-b">{editora.nome}</td>
                <td className="p-2 border-b">{editora.email}</td>
                <td className="p-2 border-b">{editora.telefone}</td>
                <td className="p-2 border-b">
                  <button
                    onClick={() => deleteEditora(editora.id)}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

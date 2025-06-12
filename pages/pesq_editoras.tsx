'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

type Editoras = {
  id: string
  nome: string
  email: string
  telefone: string
}

type Props = {
  role: string
}

function PesqEditoras({ role }: Props) {
  const router = useRouter()
  const [editoras, setEditoras] = useState<Editoras[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fetchEditoras = async (nomeFiltro?: string) => {
    setCarregando(true)

    let query = supabase
      .from('editoras')
      .select('*')
      .order('created_at', { ascending: false })

    const nomeFiltrado = (nomeFiltro || '').trim()
    if (nomeFiltrado !== '') {
      query = query.ilike('nome', `%${nomeFiltrado}%`)
    }

    const { data, error } = await query
    setCarregando(false)

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setEditoras(data || [])
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
    <div className="min-h-screen bg-[#006400] flex items-center justify-center p-4">
      <div className="w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[68px]">
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Digite o nome da editora"
            className="p-3 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-16 w-3/5 text-white font-bold"
          />
          <button
            onClick={handlePesquisar}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Pesquisar
          </button>
          <button
            onClick={() => router.push('/c_editoras')}
            className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00]"
          >
            Cadastrar Editora
          </button>
        </div>

        {carregando ? (
          <p className="text-white font-bold">Carregando...</p>
        ) : editoras.length === 0 ? (
          <p className="text-white font-bold">Nenhuma editora encontrada.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Nome</th>
                <th className="px-4 py-2 text-white">Email</th>
                <th className="px-4 py-2 text-white">Telefone</th>
                <th className="px-4 py-2 text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {editoras.map((editora) => (
                <tr key={editora.id} className="bg-[#2e8b57] text-white">
                  <td className="border border-[#006400] px-4 py-2">{editora.nome.trim()}</td>
                  <td className="border border-[#006400] px-4 py-2">{editora.email}</td>
                  <td className="border border-[#006400] px-4 py-2">{editora.telefone}</td>
                  <td className="border border-[#006400] px-4 py-2 text-center">
                    {role === 'funcionario_administrador' && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => deleteEditora(editora.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 py-1"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => router.push(`/updates/update_editoras/${editora.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ✅ Somente funcionários podem acessar essa página
export default withRoleProtection(PesqEditoras, ['funcionario', 'funcionario_administrador'])

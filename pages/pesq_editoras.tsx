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
    <div>
      <h1>Pesquisar Editoras</h1>

      <div>
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Digite o nome da editora"
        />
        <button onClick={handlePesquisar}>Pesquisar</button>
        <button onClick={() => router.push('/c_editoras')}>Cadastrar editora</button>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : editoras.length === 0 ? (
        <p>Nenhuma editora encontrada.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {editoras.map((editora) => (
              <tr key={editora.id}>
                <td>{editora.nome.trim()}</td>
                <td>{editora.email}</td>
                <td>{editora.telefone}</td>
                <td>
                  <button onClick={() => deleteEditora(editora.id)}>Excluir</button>
                  <button onClick={() => router.push(`/updates/update_editoras/${editora.id}`)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ✅ Somente funcionários podem acessar essa página
export default withRoleProtection(PesqEditoras, ['funcionario'])
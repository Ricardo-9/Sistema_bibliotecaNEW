'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import { withRoleProtection } from '../../../components/withRoleProtection'

function EditarEditora() {
  const { id } = useParams()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')

  useEffect(() => {
    const fetchEditora = async () => {
      const { data, error } = await supabase
        .from('editoras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Erro ao buscar editora')
        return
      }

      if (data) {
        setNome(data.nome)
        setEmail(data.email)
        setTelefone(data.telefone)
      }
    }

    fetchEditora()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: duplicada, error: erroBusca } = await supabase
      .from('editoras')
      .select('*')
      .eq('nome', nome)
      .neq('id', id)

    if (erroBusca) {
      alert('Erro ao verificar duplicidade')
      return
    }

    if (duplicada && duplicada.length > 0) {
      alert('Já existe uma editora com esse nome.')
      return
    }

    const { error } = await supabase
      .from('editoras')
      .update({ nome, email, telefone })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar')
    } else {
      router.push('/pesq_editoras')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Editar Editora</h1>
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Nome"
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Cleave
        name="telefone"
        placeholder="Telefone"
        options={{
          delimiters: ['(', ') ', '-', '-'],
          blocks: [0, 2, 5, 4],
          numericOnly: true,
        }}
        value={telefone}
        onChange={e => setTelefone(e.target.value)}
      />
      <button type="submit">Salvar</button>
    </form>
  )
}

// Protege a página para somente FUNCIONÁRIOS
export default withRoleProtection(EditarEditora, ['funcionario'])
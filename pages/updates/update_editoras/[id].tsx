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

  // Função para normalizar o nome (trim, lowercase e espaços simples)
  function normalizarNome(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  // Remove todos os caracteres que não sejam dígitos
  function limparNumero(str: string) {
    return str.replace(/\D/g, '')
  }

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

    const nomeNormalizado = normalizarNome(nome)
    const telefoneLimpo = limparNumero(telefone)

    // Validação do telefone: deve ter 10 ou 11 dígitos
    if (!/^\d{10,11}$/.test(telefoneLimpo)) {
      alert('O telefone deve conter 10 ou 11 dígitos numéricos.')
      return
    }

    // Busca todas as editoras exceto a que estamos editando
    const { data: todasEditoras, error: erroBusca } = await supabase
      .from('editoras')
      .select('id, nome')
      .neq('id', id)

    if (erroBusca) {
      alert('Erro ao verificar duplicidade')
      return
    }

    // Verifica duplicidade do nome normalizado
    const nomeDuplicado = todasEditoras?.some(editora =>
      normalizarNome(editora.nome) === nomeNormalizado
    )

    if (nomeDuplicado) {
      alert('Já existe uma editora com esse nome.')
      return
    }

    // Atualiza dados da editora
    const { error } = await supabase
      .from('editoras')
      .update({ nome, email, telefone: telefoneLimpo })
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
        required
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
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
        required
      />
      <button type="submit">Salvar</button>
    </form>
  )
}

// Protege a página para somente FUNCIONÁRIOS
export default withRoleProtection(EditarEditora, ['funcionario'])
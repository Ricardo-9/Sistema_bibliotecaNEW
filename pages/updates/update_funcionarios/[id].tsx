'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'

function EditarFuncionario() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    funcao: '',
    endereco: '',
    email: '',
    telefone: ''
  })

  // Normaliza nome para comparar (trim, lowercase, espaços únicos)
  function normalizarNome(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  // Remove tudo que não é dígito
  function limparNumero(str: string) {
    return str.replace(/\D/g, '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    const fetchFuncionario = async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Erro ao buscar funcionário')
        return
      }

      if (data) {
        setFormData({
          nome: data.nome,
          cpf: data.cpf,
          funcao: data.funcao,
          endereco: data.endereco,
          email: data.email,
          telefone: data.telefone
        })
      }
    }

    fetchFuncionario()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nomeNormalizado = normalizarNome(formData.nome)
    const cpfLimpo = limparNumero(formData.cpf).trim()
    const telefoneLimpo = limparNumero(formData.telefone).trim()

    // Validação do telefone: 10 ou 11 dígitos
    if (!/^\d{10,11}$/.test(telefoneLimpo)) {
      alert('O telefone deve conter 10 ou 11 dígitos numéricos.')
      return
    }

    // Buscar todos os funcionários exceto o atual para validar nome duplicado
    const { data: funcionarios, error: erroBuscaNome } = await supabase
      .from('funcionarios')
      .select('id, nome, cpf')
      .neq('id', id)

    if (erroBuscaNome) {
      alert('Erro ao verificar duplicidade do nome')
      return
    }

    // Verificar duplicidade do nome
    const nomeDuplicado = funcionarios?.some(f =>
      normalizarNome(f.nome) === nomeNormalizado
    )
    if (nomeDuplicado) {
      alert('Já existe um funcionário com esse nome.')
      return
    }

    // Verificar duplicidade do CPF
    const cpfDuplicado = funcionarios?.some(f => limparNumero(f.cpf) === cpfLimpo)
    if (cpfDuplicado) {
      alert('Já existe um funcionário com esse CPF.')
      return
    }

    const { error } = await supabase
      .from('funcionarios')
      .update({
        nome: formData.nome.trim(),
        cpf: cpfLimpo,
        endereco: formData.endereco.trim(),
        email: formData.email.trim(),
        telefone: telefoneLimpo,
        funcao: formData.funcao.trim()
      })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar')
    } else {
      router.push('/pesq_funcionarios')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Editar Funcionário</h1>
      <input
        name="nome"
        placeholder="Nome"
        required
        onChange={handleChange}
        value={formData.nome}
      />
      <Cleave
        name="cpf"
        placeholder="CPF"
        required
        value={formData.cpf}
        onChange={handleChange}
        options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
      />
      <input
        name="funcao"
        placeholder="Função"
        required
        onChange={handleChange}
        value={formData.funcao}
      />
      <input
        name="endereco"
        placeholder="Endereço"
        required
        onChange={handleChange}
        value={formData.endereco}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        onChange={handleChange}
        value={formData.email}
      />
      <Cleave
        name="telefone"
        placeholder="Telefone"
        required
        value={formData.telefone}
        onChange={handleChange}
        options={{ blocks: [0, 2, 5, 4], delimiters: ['(', ') ', '-', ''], numericOnly: true }}
      />
      <button type="submit">Salvar</button>
    </form>
  )
}

// ✅ Protegido apenas para funcionários
export default withRoleProtection(EditarFuncionario, ['funcionario'])
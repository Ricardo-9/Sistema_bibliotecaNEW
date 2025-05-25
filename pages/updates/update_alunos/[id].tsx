'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'

function EditarAluno() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    endereco: '',
    email: '',
    telefone: '',
    serie: '',
    curso: ''
  })

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
    const fetchAluno = async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Erro ao buscar aluno')
        return
      }

      if (data) {
        setFormData({
          nome: data.nome,
          cpf: data.cpf,
          matricula: data.matricula,
          endereco: data.endereco,
          email: data.email,
          telefone: data.telefone,
          serie: data.serie,
          curso: data.curso
        })
      }
    }

    fetchAluno()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cpfLimpo = limparNumero(formData.cpf).trim()
    const telefoneLimpo = limparNumero(formData.telefone).trim()
    const matriculaLimpa = formData.matricula.trim()

    const { data: duplicada, error: erroBusca } = await supabase
      .from('alunos')
      .select('*')
      .eq('cpf', cpfLimpo)
      .neq('id', id)

    if (erroBusca) {
      alert('Erro ao verificar duplicidade')
      return
    }

    if (duplicada && duplicada.length > 0) {
      alert('Já existe um aluno com esse CPF.')
      return
    }

    const { data: duplicada2, error: erroBusca2 } = await supabase
      .from('alunos')
      .select('*')
      .eq('matricula', matriculaLimpa)
      .neq('id', id)

    if (erroBusca2) {
      alert('Erro ao verificar duplicidade')
      return
    }

    if (duplicada2 && duplicada2.length > 0) {
      alert('Já existe um aluno com essa Matrícula.')
      return
    }

    const { error } = await supabase
      .from('alunos')
      .update({
        nome: formData.nome.trim(),
        cpf: cpfLimpo,
        matricula: matriculaLimpa,
        endereco: formData.endereco.trim(),
        email: formData.email.trim(),
        telefone: telefoneLimpo,
        serie: formData.serie.trim(),
        curso: formData.curso.trim()
      })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar')
    } else {
      router.push('/pesq_alunos')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Editar Aluno</h1>
      <input name="nome" placeholder="Nome" required onChange={handleChange} value={formData.nome} />
      <Cleave
        name="cpf"
        placeholder="CPF"
        required
        value={formData.cpf}
        onChange={handleChange}
        options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
      />
      <input name="matricula" placeholder="Matrícula (7 dígitos)" required onChange={handleChange} value={formData.matricula} />
      <input name="endereco" placeholder="Endereço" required onChange={handleChange} value={formData.endereco} />
      <input type="email" name="email" placeholder="Email" required onChange={handleChange} value={formData.email} />
      <Cleave
        name="telefone"
        placeholder="Telefone"
        required
        value={formData.telefone}
        onChange={handleChange}
        options={{ blocks: [0, 2, 5, 4], delimiters: ['(', ') ', '-', ''], numericOnly: true }}
      />
      <input name="serie" placeholder="Série" required onChange={handleChange} value={formData.serie} />
      <input name="curso" placeholder="Curso" required onChange={handleChange} value={formData.curso} />
      <button type="submit">Salvar</button>
    </form>
  )
}

// ✅ Protegido apenas para funcionários
export default withRoleProtection(EditarAluno, ['funcionario'])
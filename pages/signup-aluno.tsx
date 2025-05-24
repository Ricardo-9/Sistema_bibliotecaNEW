'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'

export default function SignupAluno() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    endereco: '',
    email: '',
    telefone: '',
    serie: '',
    curso: '',
    senha: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const filteredValue = filterInput(name, value)
    setFormData({ ...formData, [name]: filteredValue })
  }

  const filterInput = (name: string, value: string) => {
    switch (name) {
      case 'nome':
        return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 100)
      case 'cpf':
        return value.replace(/\D/g, '').slice(0, 11)
      case 'telefone':
        return value.replace(/\D/g, '').slice(0, 11)
      case 'matricula':
        return value.replace(/\D/g, '').slice(0, 7)
      case 'endereco':
        return value.slice(0, 150)
      case 'email':
        return value.slice(0, 100)
      case 'serie':
        return value.slice(0, 20)
      case 'curso':
        return value.slice(0, 50)
      case 'senha':
        return value.slice(0, 100)
      default:
        return value
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações adicionais
    if (formData.matricula.length !== 7) {
      setError('A matrícula deve conter exatamente 7 dígitos.')
      return
    }
    if (formData.cpf.length !== 11) {
      setError('O CPF deve conter exatamente 11 números.')
      return
    }
    if (formData.telefone.length < 10) {
      setError('Número de telefone inválido.')
      return
    }

    const { email, senha, ...dados } = formData

    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          role: 'aluno'
        }
      }
    })

    if (signUpError || !authUser.user) {
      setError(signUpError?.message || 'Erro ao cadastrar')
      return
    }

    const { error: insertError } = await supabase.from('alunos').insert({
      ...dados,
      email,
      user_id: authUser.user.id,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Aluno</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <input type="password" name="senha" placeholder="Senha" required onChange={handleChange} value={formData.senha} />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Cadastrar</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  )
}
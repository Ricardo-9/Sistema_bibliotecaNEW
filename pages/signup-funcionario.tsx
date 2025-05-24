'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'

export default function SignupFuncionario() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    funcao: '',
    cpf: '',
    email: '',
    senha: '',
    endereco: '',
    telefone: '',
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
      case 'funcao':
        return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 100)
      case 'cpf':
        return value.replace(/\D/g, '').slice(0, 11)
      case 'telefone':
        return value.replace(/\D/g, '').slice(0, 15)
      default:
        return value
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { nome, funcao, cpf, telefone, email, senha, endereco } = formData

    // Validações
    if (cpf.length !== 11) return setError('CPF deve ter exatamente 11 números.')
    if (telefone.length < 10) return setError('Telefone inválido.')

    // Cadastro no Supabase Auth
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { role: 'funcionario' },
      },
    })

    if (signUpError || !authUser.user) {
      setError(signUpError?.message || 'Erro ao cadastrar')
      return
    }

    // Inserção na tabela "funcionarios"
    const { error: insertError } = await supabase.from('funcionarios').insert({
      nome,
      funcao,
      cpf,
      telefone,
      email,
      endereco,
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
      <h1 className="text-2xl font-bold mb-4">Cadastro de Funcionário</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="nome" placeholder="Nome" required onChange={handleChange} value={formData.nome} />
        <input name="funcao" placeholder="Função" required onChange={handleChange} value={formData.funcao} />
        <Cleave
          name="cpf"
          placeholder="CPF"
          options={{
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true,
          }}
          value={formData.cpf}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          maxLength={100}
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          required
          minLength={6}
          maxLength={50}
          onChange={handleChange}
          value={formData.senha}
        />
        <input
          name="endereco"
          placeholder="Endereço"
          required
          maxLength={200}
          onChange={handleChange}
          value={formData.endereco}
        />
        <Cleave
          name="telefone"
          placeholder="Telefone"
          options={{
            delimiters: ['(', ') ', ' ', '-'],
            blocks: [0, 2, 5, 4],
            numericOnly: true,
          }}
          value={formData.telefone}
          onChange={handleChange}
        />
        <button className="bg-orange-600 text-white px-4 py-2 rounded">Cadastrar</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  )
}
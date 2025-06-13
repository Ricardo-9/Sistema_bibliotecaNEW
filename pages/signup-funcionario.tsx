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
    role: 'funcionario',
  })
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      case 'role':
        return value
      default:
        return value
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { nome, funcao, cpf, telefone, email, senha, endereco, role } = formData

    if (cpf.length !== 11) return setError('CPF deve ter exatamente 11 números.')
    if (telefone.length < 10) return setError('Telefone inválido.')

    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { role } },
    })

    if (signUpError || !authUser.user) {
      setError(signUpError?.message || 'Erro ao cadastrar')
      return
    }

    const { error: insertError } = await supabase
      .from('funcionarios')
      .insert({
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

  const inputClasses = 'w-full p-4 rounded-full font-semibold text-emerald-900 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-800/30 placeholder:text-lg placeholder:font-bold'

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl p-10 bg-[#2e8b57] rounded-3xl shadow-xl">
        <h1 className="text-white text-3xl font-bold text-center mb-8">Cadastro de Funcionário</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="nome"
            placeholder="Nome"
            required
            onChange={handleChange}
            value={formData.nome}
            className={inputClasses}
          />
          <input
            name="funcao"
            placeholder="Função"
            required
            onChange={handleChange}
            value={formData.funcao}
            className={inputClasses}
          />
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
            className={inputClasses}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            maxLength={100}
            onChange={handleChange}
            value={formData.email}
            className={inputClasses}
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
            className={inputClasses}
          />
          <input
            name="endereco"
            placeholder="Endereço"
            required
            maxLength={200}
            onChange={handleChange}
            value={formData.endereco}
            className={inputClasses}
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
            className={inputClasses}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="funcionario">Funcionário</option>
            <option value="funcionario_administrador">Funcionário Administrador</option>
          </select>

          <button
            type="submit"
            className="bg-white text-emerald-900 font-bold rounded-full px-6 py-3 hover:bg-emerald-100 transition"
          >
            Cadastre-se
          </button>

          {error && <p className="text-white text-center font-semibold">{error}</p>}

          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-white text-center hover:underline mt-2"
          >
            Voltar para o início
          </button>
        </form>
      </div>
    </div>
  )
}
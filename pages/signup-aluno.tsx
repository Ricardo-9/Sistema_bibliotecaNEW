'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import Img from './imgs/img2.png'

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
      options: { data: { role: 'aluno' } },
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
    <div className="min-h-screen bg-[#006400] flex p-4">
      <div
        className="
          w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[10px]
          grid grid-rows-[auto_1fr_auto] gap-y-4 h-full
        "
      >
        <div className="bg-[#2e8b57] flex items-center justify-center" id="imagem">
          <Image src={Img} alt="imagem" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#2e8b57] p-4 rounded-lg"
        >
          {/* Coluna esquerda */}
          <div className="flex flex-col gap-4">
            <input
              name="nome"
              placeholder="Nome"
              required
              onChange={handleChange}
              value={formData.nome}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <Cleave
              name="cpf"
              placeholder="CPF"
              required
              options={{ delimiters: ['.', '.', '-'], blocks: [3, 3, 3, 2], numericOnly: true }}
              value={formData.cpf}
              onChange={handleChange}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <input
              name="matricula"
              placeholder="Matrícula (7 dígitos)"
              required
              onChange={handleChange}
              value={formData.matricula}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <input
              name="endereco"
              placeholder="Endereço"
              required
              onChange={handleChange}
              value={formData.endereco}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
          </div>

          {/* Coluna direita */}
          <div className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              maxLength={100}
              onChange={handleChange}
              value={formData.email}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <Cleave
              name="telefone"
              placeholder="Telefone"
              required
              options={{ delimiters: ['(', ') ', ' ', '-'], blocks: [0, 2, 5, 4], numericOnly: true }}
              value={formData.telefone}
              onChange={handleChange}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <input
              name="serie"
              placeholder="Série"
              required
              onChange={handleChange}
              value={formData.serie}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />
            <input
              name="curso"
              placeholder="Curso"
              required
              onChange={handleChange}
              value={formData.curso}
              className='p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
            />

            {/* Campo de senha centralizado horizontalmente na coluna */}
            <div className="flex justify-center">
              <input
                type="password"
                name="senha"
                placeholder="Senha"
                required
                minLength={6}
                maxLength={50}
                onChange={handleChange}
                value={formData.senha}
                className='w-full p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'
              />
            </div>
          </div>

          {/* Botões */}
          <div className="col-span-full flex flex-col items-center mt-4 gap-2">
            <button
              type="submit"
              className="bg-[#006400] text-white font-bold rounded-full px-6 py-3 hover:bg-[#004d00] w-full max-w-xs"
            >
              Cadastrar
            </button>
            {error && <p className="text-white font-bold">{error}</p>}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-[#006400] text-white font-bold rounded-full px-6 py-3 hover:bg-[#004d00] mt-2 w-full max-w-xs"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

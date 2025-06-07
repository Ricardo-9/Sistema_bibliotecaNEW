'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import Img from './imgs/img2.png'

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

  const inputClasses = 'p-3 mt-2 border-4 bg-[#006400] rounded-full focus:outline-none focus:ring-2 h-20 placeholder:text-lg placeholder:font-bold pl-8 text-white font-bold'

  return (
    <div className="min-h-screen bg-[#006400] flex p-4">
      <div
        className="
          w-full p-8 m-8 bg-[#2e8b57] rounded-lg shadow-md pt-[10px]
          grid grid-rows- content-between gap-y-2 h-full
        "
      >
        {/* Imagem */}
        <div className="bg-[#2e8b57] flex items-center justify-center" id="imagem">
          <Image src={Img} alt="imagem" />
        </div>

        {/* Inputs */}
        <div className="bg-[#2e8b57] p-4" id="inputs">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coluna esquerda */}
            <div className="flex flex-col gap-4">
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
            </div>
            {/* Coluna direita */}
            <div className="flex flex-col gap-4">
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
            </div>
            {/* Botão */}
            <div className="bg-[#2e8b57] col-span-full flex justify-center mt-4" id="botão">
              <button type="submit" className="bg-[#006400] text-white font-bold rounded-full px-4 py-2 hover:bg-[#004d00] flex items-center justify-center">
                Cadastre-se
              </button>
              {error && <p className="text-white">{error}</p>}
              <button onClick={() => router.push('/')} className='bg-[#006400] text-white font-bold rounded-full absolute top-16 left-16 px-4 py-2 hover:bg-[#004d00]'>Voltar</button>
            </div>
          </form>
        </div>

        
      </div>
    </div>
  )
}

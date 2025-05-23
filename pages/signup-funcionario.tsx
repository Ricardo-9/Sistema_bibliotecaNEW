import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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

    const { email, senha, ...dados } = formData

    // Cadastro no Supabase Auth
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          role: 'funcionario'
        }
      }
    })
    if (signUpError || !authUser.user) {
      setError(signUpError?.message || 'Erro ao cadastrar')
      return
    }

    // Inserção na tabela "funcionarios"
    const { error: insertError } = await supabase.from('funcionarios').insert({
      ...dados,
      email,          // Inclui o email para evitar erro not-null
      user_id: authUser.user.id,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/dashboard') // redireciona para dashboard ou página desejada
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Funcionário</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="nome" placeholder="Nome" required onChange={handleChange} value={formData.nome} />
        <input name="funcao" placeholder="Função" required onChange={handleChange} value={formData.funcao} />
        <input name="cpf" placeholder="CPF" required onChange={handleChange} value={formData.cpf} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} value={formData.email} />
        <input type="password" name="senha" placeholder="Senha" required onChange={handleChange} value={formData.senha} />
        <input name="endereco" placeholder="Endereço" required onChange={handleChange} value={formData.endereco} />
        <input name="telefone" placeholder="Telefone" required onChange={handleChange} value={formData.telefone} />
        <button className="bg-orange-600 text-white px-4 py-2 rounded">Cadastrar</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  )
}
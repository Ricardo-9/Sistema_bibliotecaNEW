
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { withGuestProtection } from '../components/withGuestProtection'

function SignupAluno() {
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
  const [msg, setMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const filteredValue = filterInput(name, value)
    setFormData({ ...formData, [name]: filteredValue })
    setError('')
    setMsg('')
  }

  const filterInput = (name: string, value: string) => {
    switch (name) {
      case 'nome': return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 100)
      case 'cpf':
      case 'telefone': return value.replace(/\D/g, '').slice(0, 11)
      case 'matricula': return value.replace(/\D/g, '').slice(0, 7)
      case 'endereco': return value.slice(0, 150)
      case 'email': return value.slice(0, 100)
      case 'serie': return value.slice(0, 20)
      case 'curso': return value.slice(0, 50)
      case 'senha': return value.slice(0, 100)
      default: return value
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMsg('')

    if (formData.matricula.length !== 7) return setError('A matrícula deve conter 7 dígitos.')
    if (formData.cpf.length !== 11) return setError('O CPF deve conter 11 números.')
    if (formData.telefone.length < 10) return setError('Telefone inválido.')

    const { email, senha, ...dados } = formData
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { role: 'aluno' } },
    })

    if (signUpError || !authUser.user) return setError(signUpError?.message || 'Erro ao cadastrar.')

    const { error: insertError } = await supabase.from('alunos').insert({
      ...dados,
      email,
      user_id: authUser.user.id,
    })

    if (insertError) setError(insertError.message)
    else {
      setMsg('Cadastro realizado com sucesso!')
      setTimeout(() => router.push('/painel_aluno'), 1500)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        <button
          onClick={() => router.push('/')}
          className="bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center flex items-center gap-2 mb-8">
          <UserPlus className="w-8 h-8" /> Cadastro de Aluno
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input className="input-style" name="nome" placeholder="Nome completo" value={formData.nome} onChange={handleChange} required />

          <Cleave
            className="w-full p-4 rounded-full font-semibold text-emerald-900 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-800/30"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            options={{
              delimiters: ['.', '.', '-'],
              blocks: [3, 3, 3, 2],
              numericOnly: true,
            }}
            required
          />

          <input className="input-style" name="matricula" placeholder="Matrícula (7 dígitos)" value={formData.matricula} onChange={handleChange} required />
          <input className="input-style" name="endereco" placeholder="Endereço" value={formData.endereco} onChange={handleChange} required />
          <input className="input-style" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

          <Cleave
            className="w-full p-4 rounded-full font-semibold text-emerald-900 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-800/30"
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            options={{
              delimiters: ['(', ') ', ' ', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true,
            }}
            required
          />

          <select name="serie" value={formData.serie} onChange={handleChange} required className="input-style">
            <option value="">Selecione a série</option>
            <option value="1 ano">1º Ano</option>
            <option value="2 ano">2º Ano</option>
            <option value="3 ano">3º Ano</option>
          </select>

          <select name="curso" value={formData.curso} onChange={handleChange} required className="input-style">
            <option value="">Selecione o curso</option>
            <option value="adm">Administração</option>
            <option value="agro">Agropecuária</option>
            <option value="infor">Informática</option>
            <option value="regencia">Regência</option>
          </select>

          <input className="input-style" name="senha" type="password" placeholder="Senha" value={formData.senha} onChange={handleChange} required minLength={6} />

          <button type="submit" className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg">
            Cadastrar
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 9999px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
          font-weight: 600;
          color: #064e3b;
          background-color: white;
          outline: none;
        }
        .input-style:focus {
          box-shadow: 0 0 0 4px #064e3b40;
        }
      `}</style>
    </div>
  )
}


export default withGuestProtection(SignupAluno)
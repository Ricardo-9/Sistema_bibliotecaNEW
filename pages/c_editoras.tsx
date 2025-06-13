'use client'

import { useRouter } from 'next/navigation'
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { withRoleProtection } from '../components/withRoleProtection'
import Cleave from "cleave.js/react"
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'
import { ArrowLeft, LogOut, Landmark } from 'lucide-react'

function CadastroEditoras() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setMsg('')
  }

  function handleTelefoneChange(e: any) {
    setForm({ ...form, telefone: e.target.value })
    setError('')
    setMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMsg('')

    if (form.telefone.length < 15) {
      setError("Telefone incompleto")
      return
    }

    const { data: editorasExistentes, error: fetchError } = await supabase
      .from('editoras')
      .select('nome')
      .eq('nome', form.nome.trim())

    if (fetchError) {
      setError('Erro ao verificar editora existente: ' + fetchError.message)
      return
    }

    if (editorasExistentes.length > 0) {
      setError('Já existe uma editora com esse nome cadastrado.')
      return
    }

    const { error } = await supabase.from('editoras').insert([{
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim()
    }])

    if (error) {
      setError("Não foi possível cadastrar a editora")
    } else {
      setMsg("Cadastro concluído com sucesso!")
      setForm({ nome: "", email: "", telefone: "" })
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">

      {/* Botões de topo */}
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <Landmark className="w-8 h-8" /> Cadastro de Editoras
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="nome"
            placeholder="Nome"
            required
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
          />
          <Cleave
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleTelefoneChange}
            options={{
              delimiters: ['(', ') ', '-', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
            required
          />
          <button
            type="submit"
            className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default withRoleProtection(CadastroEditoras, ['funcionario', 'funcionario_administrador'])

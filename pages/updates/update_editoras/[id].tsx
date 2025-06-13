'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { withRoleProtection } from '../../../components/withRoleProtection'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png'
import Cleave from 'cleave.js/react'
import { ArrowLeft, Landmark } from 'lucide-react'

function EditarEditora() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  })

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  function normalizarNome(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

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
    const fetchEditora = async () => {
      const { data, error } = await supabase
        .from('editoras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setErro('Erro ao buscar editora.')
        return
      }

      if (data) {
        setFormData({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone
        })
      }
    }

    fetchEditora()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErro('')
    setMensagem('')

    const nomeNormalizado = normalizarNome(formData.nome)
    const emailNormalizado = formData.email.trim().toLowerCase()
    const telefoneLimpo = limparNumero(formData.telefone)

    if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) {
      setErro('Email inválido.')
      return
    }

    if (!/^\d{10,11}$/.test(telefoneLimpo)) {
      setErro('O telefone deve conter 10 ou 11 dígitos numéricos.')
      return
    }

    const { data: todasEditoras, error: erroBusca } = await supabase
      .from('editoras')
      .select('id, nome, email')
      .neq('id', id)

    if (erroBusca) {
      setErro('Erro ao verificar duplicidade.')
      return
    }

    const nomeDuplicado = todasEditoras?.some(
      editora => normalizarNome(editora.nome) === nomeNormalizado
    )

    const emailDuplicado = todasEditoras?.some(
      editora => editora.email.trim().toLowerCase() === emailNormalizado
    )

    if (nomeDuplicado) {
      setErro('Já existe uma editora com esse nome.')
      return
    }

    if (emailDuplicado) {
      setErro('Já existe uma editora com esse email.')
      return
    }

    const { error } = await supabase
      .from('editoras')
      .update({
        nome: formData.nome.trim(),
        email: emailNormalizado,
        telefone: telefoneLimpo
      })
      .eq('id', id)

    if (error) {
      setErro('Erro ao atualizar.')
    } else {
      setMensagem('Editora atualizada com sucesso!')
      setTimeout(() => router.push('/pesq_editoras'), 2000)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
     

      {/* Botão voltar */}
      <button
        onClick={() => router.push('/pesq_editoras')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <Landmark className="w-8 h-8" /> Editar Editora
        </h1>

        {erro && <p className="text-red-400 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
          />

          <Cleave
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            options={{
              blocks: [0, 2, 5, 4],
              delimiters: ['(', ') ', '-', ''],
              numericOnly: true
            }}
          />

          <button
            type="submit"
            className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarEditora, ['funcionario', 'funcionario_administrador'])

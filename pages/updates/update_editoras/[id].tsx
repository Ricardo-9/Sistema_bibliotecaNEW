'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import { withRoleProtection } from '../../../components/withRoleProtection'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png'

function EditarEditora() {
  const { id } = useParams()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  function normalizarNome(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  function limparNumero(str: string) {
    return str.replace(/\D/g, '')
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
        setNome(data.nome)
        setEmail(data.email)
        setTelefone(data.telefone)
      }
    }

    fetchEditora()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErro('')
    setMensagem('')

    const nomeNormalizado = normalizarNome(nome)
    const emailNormalizado = email.trim().toLowerCase()
    const telefoneLimpo = limparNumero(telefone)

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
        nome: nome.trim(),
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
      <Image
        src={brasao}
        alt="Logo do Ceará"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 bg-[#2e8b57] rounded-3xl p-8 sm:p-12 max-w-2xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Editar Editora</h1>

        {erro && <p className="text-red-300 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-300 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome"
            required
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <Cleave
            name="telefone"
            placeholder="Telefone"
            options={{
              delimiters: ['(', ') ', '-', ''],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            required
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#006400] text-white font-bold py-3 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg"
          >
            Salvar alterações
          </button>
        </form>
        <br></br>
        <button
              type="button"
              onClick={() => router.push('/pesq_editoras')}
              className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
            >
              Voltar
            </button>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarEditora, ['funcionario', 'funcionario_administrador'])

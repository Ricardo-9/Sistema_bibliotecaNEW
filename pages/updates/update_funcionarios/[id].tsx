'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import { ArrowLeft, UserCog } from 'lucide-react'
import brasao from '../../imgs/Bc.png.png'

function EditarFuncionario() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    funcao: '',
    endereco: '',
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
    const fetchFuncionario = async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setErro('Erro ao buscar funcionário.')
        return
      }

      if (data) {
        setFormData({
          nome: data.nome,
          cpf: data.cpf,
          funcao: data.funcao,
          endereco: data.endereco,
          email: data.email,
          telefone: data.telefone
        })
      }
    }

    fetchFuncionario()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    const nomeNormalizado = normalizarNome(formData.nome)
    const cpfLimpo = limparNumero(formData.cpf).trim()
    const telefoneLimpo = limparNumero(formData.telefone).trim()

    if (!/^\d{10,11}$/.test(telefoneLimpo)) {
      setErro('O telefone deve conter 10 ou 11 dígitos numéricos.')
      return
    }

    const { data: funcionarios, error: erroBuscaNome } = await supabase
      .from('funcionarios')
      .select('id, nome, cpf')
      .neq('id', id)

    if (erroBuscaNome) {
      setErro('Erro ao verificar duplicidade do nome.')
      return
    }

    const nomeDuplicado = funcionarios?.some(f =>
      normalizarNome(f.nome) === nomeNormalizado
    )
    if (nomeDuplicado) {
      setErro('Já existe um funcionário com esse nome.')
      return
    }

    const cpfDuplicado = funcionarios?.some(f => limparNumero(f.cpf) === cpfLimpo)
    if (cpfDuplicado) {
      setErro('Já existe um funcionário com esse CPF.')
      return
    }

    const { error } = await supabase
      .from('funcionarios')
      .update({
        nome: formData.nome.trim(),
        cpf: cpfLimpo,
        endereco: formData.endereco.trim(),
        email: formData.email.trim(),
        telefone: telefoneLimpo,
        funcao: formData.funcao.trim()
      })
      .eq('id', id)

    if (error) {
      setErro('Erro ao atualizar funcionário: ' + error.message)
    } else {
      setMensagem('Funcionário atualizado com sucesso!')
      setTimeout(() => router.push('/pesq_funcionarios'), 2000)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
     

      <button
        onClick={() => router.push('/pesq_funcionarios')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <UserCog className="w-8 h-8" /> Editar Funcionário
        </h1>

        {erro && <p className="text-red-400 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {["nome", "funcao", "endereco", "email"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            />
          ))}

          <Cleave
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
          />

          <Cleave
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            options={{ blocks: [0, 2, 5, 4], delimiters: ['(', ') ', '-', ''], numericOnly: true }}
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

export default withRoleProtection(EditarFuncionario, ['funcionario_administrador'])

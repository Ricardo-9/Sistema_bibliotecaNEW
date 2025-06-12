'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png' // Ajuste o caminho conforme sua estrutura

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
        setErro('Erro ao buscar funcionário')
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
      setErro('Erro ao verificar duplicidade do nome')
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
      <Image
        src={brasao}
        alt="Logo do Ceará"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 bg-[#2e8b57] rounded-3xl p-8 sm:p-12 max-w-2xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Editar Funcionário</h1>

        {erro && <p className="text-red-300 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-300 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome"
            required
            onChange={handleChange}
            value={formData.nome}
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <Cleave
            name="cpf"
            placeholder="CPF"
            required
            value={formData.cpf}
            onChange={handleChange}
            options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <input
            name="funcao"
            placeholder="Função"
            required
            onChange={handleChange}
            value={formData.funcao}
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <input
            name="endereco"
            placeholder="Endereço"
            required
            onChange={handleChange}
            value={formData.endereco}
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            value={formData.email}
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
          />

          <Cleave
            name="telefone"
            placeholder="Telefone"
            required
            value={formData.telefone}
            onChange={handleChange}
            options={{ blocks: [0, 2, 5, 4], delimiters: ['(', ') ', '-', ''], numericOnly: true }}
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
              onClick={() => router.push('/pesq_funcionarios')}
              className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
            >
              Voltar
            </button>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarFuncionario, ['funcionario_administrador'])
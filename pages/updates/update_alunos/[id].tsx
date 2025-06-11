'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png'

function EditarAluno() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    endereco: '',
    email: '',
    telefone: '',
    serie: '',
    curso: ''
  })

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

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
    const fetchAluno = async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setErro('Erro ao buscar aluno.')
        return
      }

      if (data) {
        setFormData({
          nome: data.nome,
          cpf: data.cpf,
          matricula: data.matricula,
          endereco: data.endereco,
          email: data.email,
          telefone: data.telefone,
          serie: data.serie,
          curso: data.curso
        })
      }
    }

    fetchAluno()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErro('')
    setMensagem('')

    const cpfLimpo = limparNumero(formData.cpf).trim()
    const telefoneLimpo = limparNumero(formData.telefone).trim()
    const matriculaLimpa = formData.matricula.trim()
    const nomeLimpo = formData.nome.trim().toLowerCase().replace(/\s+/g, ' ')

    if (!/^\d{7}$/.test(matriculaLimpa)) {
      setErro('A matrícula deve conter exatamente 7 dígitos numéricos.')
      return
    }

    const { data: duplicadaCPF, error: erroBuscaCPF } = await supabase
      .from('alunos')
      .select('*')
      .eq('cpf', cpfLimpo)
      .neq('id', id)

    if (erroBuscaCPF) {
      setErro('Erro ao verificar duplicidade do CPF.')
      return
    }

    if (duplicadaCPF && duplicadaCPF.length > 0) {
      setErro('Já existe um aluno com esse CPF.')
      return
    }

    const { data: duplicadaMatricula, error: erroBuscaMatricula } = await supabase
      .from('alunos')
      .select('*')
      .eq('matricula', matriculaLimpa)
      .neq('id', id)

    if (erroBuscaMatricula) {
      setErro('Erro ao verificar duplicidade da matrícula.')
      return
    }

    if (duplicadaMatricula && duplicadaMatricula.length > 0) {
      setErro('Já existe um aluno com essa Matrícula.')
      return
    }

    const { data: todosAlunos, error: erroBuscaNome } = await supabase
      .from('alunos')
      .select('id, nome')
      .neq('id', id)

    if (erroBuscaNome) {
      setErro('Erro ao verificar duplicidade do nome.')
      return
    }

    const nomeDuplicado = todosAlunos?.some(aluno =>
      aluno.nome.trim().toLowerCase().replace(/\s+/g, ' ') === nomeLimpo
    )

    if (nomeDuplicado) {
      setErro('Já existe um aluno com esse nome.')
      return
    }

    const { error } = await supabase
      .from('alunos')
      .update({
        nome: formData.nome.trim(),
        cpf: cpfLimpo,
        matricula: matriculaLimpa,
        endereco: formData.endereco.trim(),
        email: formData.email.trim(),
        telefone: telefoneLimpo,
        serie: formData.serie.trim(),
        curso: formData.curso.trim()
      })
      .eq('id', id)

    if (error) {
      console.error(error)
      setErro('Erro ao atualizar.')
    } else {
      setMensagem('Aluno atualizado com sucesso!')
      setTimeout(() => router.push('/pesq_alunos'), 2000)
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Editar Aluno</h1>

        {erro && <p className="text-red-300 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-300 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" name="nome" placeholder="Nome" required onChange={handleChange} value={formData.nome} />
          <Cleave
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            name="cpf"
            placeholder="CPF"
            required
            value={formData.cpf}
            onChange={handleChange}
            options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
          />
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" name="matricula" placeholder="Matrícula (7 dígitos)" required onChange={handleChange} value={formData.matricula} />
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" name="endereco" placeholder="Endereço" required onChange={handleChange} value={formData.endereco} />
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" type="email" name="email" placeholder="Email" required onChange={handleChange} value={formData.email} />
          <Cleave
            className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none"
            name="telefone"
            placeholder="Telefone"
            required
            value={formData.telefone}
            onChange={handleChange}
            options={{ blocks: [0, 2, 5, 4], delimiters: ['(', ') ', '-', ''], numericOnly: true }}
          />
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" name="serie" placeholder="Série" required onChange={handleChange} value={formData.serie} />
          <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" name="curso" placeholder="Curso" required onChange={handleChange} value={formData.curso} />

          <button type="submit" className="w-full bg-[#006400] text-white font-bold py-3 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg">
            Salvar alterações
          </button>
        </form>
        <br></br>
        <button
              type="button"
              onClick={() => router.push('/pesq_alunos')}
              className="w-full bg-transparent border border-white py-2 rounded-[20px] hover:bg-white hover:text-[#006400] transition duration-300"
            >
              Voltar
            </button>
      </div>
    </div>
  )
}

export default withRoleProtection(EditarAluno, ['funcionario_administrador'])
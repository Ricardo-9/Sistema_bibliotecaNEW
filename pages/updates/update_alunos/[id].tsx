'use client'

import { withRoleProtection } from '../../../components/withRoleProtection'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Image from 'next/image'
import brasao from '../../imgs/Bc.png.png'
import { ArrowLeft, UserCog } from 'lucide-react'
import Cleave from 'cleave.js/react'

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
      setErro('Erro ao atualizar.')
    } else {
      setMensagem('Aluno atualizado com sucesso!')
      setTimeout(() => router.push('/pesq_alunos'), 2000)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
     

      {/* Botão voltar */}
      <button
        onClick={() => router.push('/pesq_alunos')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <UserCog className="w-8 h-8" /> Editar Aluno
        </h1>

        {erro && <p className="text-red-400 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: 'nome', placeholder: 'Nome' },
            { name: 'matricula', placeholder: 'Matrícula (7 dígitos)' },
            { name: 'endereco', placeholder: 'Endereço' },
            { name: 'email', placeholder: 'Email', type: 'email' },
            { name: 'serie', placeholder: 'Série' },
            { name: 'curso', placeholder: 'Curso' }
          ].map(({ name, placeholder, type }) => (
            <input
              key={name}
              name={name}
              type={type || 'text'}
              placeholder={placeholder}
              value={(formData as any)[name]}
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

export default withRoleProtection(EditarAluno, ['funcionario_administrador'])

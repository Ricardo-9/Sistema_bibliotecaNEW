'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'

type PerfilUsuario = {
  tipo: 'aluno' | 'funcionario'
  nome: string
  email: string
  cpf: string
  endereco: string
  telefone: string
  matricula?: string
  curso?: string
  serie?: string
  funcao?: string
}

function EditarPerfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { user }, error: erroUser } = await supabase.auth.getUser()

      if (erroUser || !user) {
        setErro('Usuário não autenticado')
        return
      }

      const { data: aluno } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (aluno) {
        setPerfil({
          tipo: 'aluno',
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          endereco: aluno.endereco,
          telefone: aluno.telefone,
          matricula: aluno.matricula,
          curso: aluno.curso,
          serie: aluno.serie
        })
        return
      }

      const { data: funcionario } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (funcionario) {
        setPerfil({
          tipo: 'funcionario',
          nome: funcionario.nome,
          email: funcionario.email,
          cpf: funcionario.cpf,
          endereco: funcionario.endereco,
          telefone: funcionario.telefone,
          funcao: funcionario.funcao
        })
        return
      }

      setErro('Usuário não encontrado')
    }

    carregarPerfil()
  }, [])

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !perfil) return

    const tabela = perfil.tipo === 'aluno' ? 'alunos' : 'funcionarios'

    const { error } = await supabase
      .from(tabela)
      .update({
        nome: perfil.nome,
        email: perfil.email,
        cpf: perfil.cpf,
        endereco: perfil.endereco,
        telefone: perfil.telefone,
        ...(perfil.tipo === 'aluno' && {
          matricula: perfil.matricula,
          curso: perfil.curso,
          serie: perfil.serie
        }),
        ...(perfil.tipo === 'funcionario' && {
          funcao: perfil.funcao
        })
      })
      .eq('user_id', user.id)

    if (error) {
      setErro('Erro ao atualizar perfil: ' + error.message)
    } else {
      setMensagem('Perfil atualizado com sucesso!')
      setTimeout(() => router.push('/perfil'), 2000)
    }
  }

  if (!perfil && !erro) return <p className="p-4 text-white">Carregando...</p>

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
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Editar Perfil</h1>

        {erro && <p className="text-red-300 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-300 text-center mb-4">{mensagem}</p>}

        {perfil && (
          <form onSubmit={handleSalvar} className="space-y-4">
            <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Nome" value={perfil.nome} onChange={e => setPerfil({ ...perfil, nome: e.target.value })} />
            <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Email" value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} />
            <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="CPF" value={perfil.cpf} onChange={e => setPerfil({ ...perfil, cpf: e.target.value })} />
            <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Endereço" value={perfil.endereco} onChange={e => setPerfil({ ...perfil, endereco: e.target.value })} />
            <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Telefone" value={perfil.telefone} onChange={e => setPerfil({ ...perfil, telefone: e.target.value })} />

            {perfil.tipo === 'aluno' && (
              <>
                <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Matrícula" value={perfil.matricula} onChange={e => setPerfil({ ...perfil, matricula: e.target.value })} />
                <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Curso" value={perfil.curso} onChange={e => setPerfil({ ...perfil, curso: e.target.value })} />
                <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Série" value={perfil.serie} onChange={e => setPerfil({ ...perfil, serie: e.target.value })} />
              </>
            )}

            {perfil.tipo === 'funcionario' && (
              <input className="w-full p-3 rounded-lg border-none shadow-inner focus:outline-none" placeholder="Função" value={perfil.funcao} onChange={e => setPerfil({ ...perfil, funcao: e.target.value })} />
            )}

            <button type="submit" className="w-full bg-[#006400] text-white font-bold py-3 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg">
              Salvar alterações
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(EditarPerfil, ['aluno', 'funcionario', 'funcionario_administrador'])
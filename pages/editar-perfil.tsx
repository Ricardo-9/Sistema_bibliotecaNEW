'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'
import Image from 'next/image'
import { ArrowLeft, UserCog } from 'lucide-react'
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
      

      {/* Botão voltar */}
      <button
        onClick={() => router.push('/perfil')}
        className="absolute top-4 right-4 bg-white text-[#006400] rounded-full p-2 shadow-md hover:bg-emerald-100 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <UserCog className="w-8 h-8" /> Editar Perfil
        </h1>

        {erro && <p className="text-red-400 text-center mb-4">{erro}</p>}
        {mensagem && <p className="text-green-400 text-center mb-4">{mensagem}</p>}

        {perfil && (
          <form onSubmit={handleSalvar} className="space-y-5">
            {[{ label: 'Nome', key: 'nome' },
              { label: 'Email', key: 'email' },
              { label: 'CPF', key: 'cpf' },
              { label: 'Endereço', key: 'endereco' },
              { label: 'Telefone', key: 'telefone' }
            ].map(({ label, key }) => (
              <input
                key={key}
                className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
                placeholder={label}
                value={(perfil as any)[key]}
                onChange={e => setPerfil({ ...perfil, [key]: e.target.value })}
              />
            ))}

            {perfil.tipo === 'aluno' && (
              <>
                {[{ label: 'Matrícula', key: 'matricula' },
                  { label: 'Curso', key: 'curso' },
                  { label: 'Série', key: 'serie' }
                ].map(({ label, key }) => (
                  <input
                    key={key}
                    className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
                    placeholder={label}
                    value={(perfil as any)[key]}
                    onChange={e => setPerfil({ ...perfil, [key]: e.target.value })}
                  />
                ))}
              </>
            )}

            {perfil.tipo === 'funcionario' && (
              <input
                className="w-full p-4 rounded-full border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
                placeholder="Função"
                value={perfil.funcao}
                onChange={e => setPerfil({ ...perfil, funcao: e.target.value })}
              />
            )}

            <button
              type="submit"
              className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
            >
              Salvar alterações
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(EditarPerfil, ['aluno', 'funcionario', 'funcionario_administrador'])

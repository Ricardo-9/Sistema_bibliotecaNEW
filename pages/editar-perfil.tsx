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
                className="input-style"
                placeholder={label}
                value={(perfil as any)[key]}
                onChange={e => setPerfil({ ...perfil, [key]: e.target.value })}
              />
            ))}

            {perfil.tipo === 'aluno' && (
              <>
                <input
                  className="input-style"
                  placeholder="Matrícula"
                  value={perfil.matricula}
                  onChange={(e) => setPerfil({ ...perfil, matricula: e.target.value.replace(/\D/g, '').slice(0, 7) })}
                />

                <select
                  className="input-style"
                  value={perfil.serie}
                  onChange={(e) => setPerfil({ ...perfil, serie: e.target.value })}
                  required
                >
                  <option value="">Selecione a série</option>
                  <option value="1 ano">1º Ano</option>
                  <option value="2 ano">2º Ano</option>
                  <option value="3 ano">3º Ano</option>
                </select>

                <select
                  className="input-style"
                  value={perfil.curso}
                  onChange={(e) => setPerfil({ ...perfil, curso: e.target.value })}
                  required
                >
                  <option value="">Selecione o curso</option>
                  <option value="adm">Administração</option>
                  <option value="agro">Agropecuária</option>
                  <option value="infor">Informática</option>
                  <option value="regencia">Regência</option>
                </select>
              </>
            )}

            {perfil.tipo === 'funcionario' && (
              <input
                className="input-style"
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

export default withRoleProtection(EditarPerfil, ['aluno', 'funcionario', 'funcionario_administrador'])

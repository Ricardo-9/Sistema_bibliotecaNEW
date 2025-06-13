'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

import { BookOpen, ArrowLeft } from 'lucide-react'

import Select from 'react-select'

function CadastroEmprestimos() {
  const router = useRouter()

  const [selectedLivro, setSelectedLivro] = useState<{ value: string; label: string } | null>(null)
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<{ id: string; nome: string }[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataDevolucaoFormatada, setDataDevolucaoFormatada] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<{ id: string, tipo: 'aluno' | 'funcionario' | 'funcionario_administrador' } | null>(null)

  useEffect(() => {
    async function fetchLivros() {
      const { data, error } = await supabase
        .from('livros')
        .select('id, nome')
        .gt('q_disponivel', 0)
        .order('nome')

      if (!error && data) {
        setLivrosDisponiveis(data)
      } else {
        setError('Erro ao carregar os livros disponíveis')
      }
    }

    async function fetchUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (aluno) {
        setUsuario({ id: aluno.id, tipo: 'aluno' })
      } else {
        const { data: funcionario } = await supabase
          .from('funcionarios')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (funcionario) {
          setUsuario({ id: funcionario.id, tipo: 'funcionario' })
        } else {
          setError('Usuário não encontrado nas tabelas de alunos ou funcionários')
        }
      }
    }

    fetchLivros()
    fetchUsuario()
  }, [])

  const options = livrosDisponiveis.map(livro => ({
    value: livro.id,
    label: livro.nome,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)

    if (!usuario) {
      setError('Usuário não autenticado corretamente.')
      return
    }

    if (!selectedLivro) {
      setError('Selecione um livro')
      return
    }

    const livroSelecionado = livrosDisponiveis.find(l => l.id === selectedLivro.value)
    if (!livroSelecionado) {
      setError('Livro não encontrado')
      return
    }

    const { data: livroDados, error: erroLivro } = await supabase
      .from('livros')
      .select('q_disponivel')
      .eq('id', selectedLivro.value)
      .maybeSingle()

    if (erroLivro || !livroDados) {
      setError('Erro ao obter dados do livro')
      return
    }

    if (livroDados.q_disponivel <= 0) {
      setError('Não há exemplares disponíveis')
      return
    }

    const { data: emprestimoExistente } = await supabase
      .from('emprestimos')
      .select('*')
      .eq('nome_livro', selectedLivro.value)
      .eq('solicitante_id', usuario.id)
      .eq('tipo_solicitante', usuario.tipo)
      .is('devolvido', null)
      .maybeSingle()

    if (emprestimoExistente) {
      setError('Você já possui este livro emprestado.')
      return
    }

    const dataEmprestimo = new Date()
    const dataDevolucao = new Date()
    dataDevolucao.setDate(dataEmprestimo.getDate() + 30)

    const { error: erroInsercao } = await supabase.from('emprestimos').insert([{
      nome_livro: selectedLivro.value,
      solicitante_id: usuario.id,
      tipo_solicitante: usuario.tipo,
      data_devolucao: dataDevolucao.toISOString(),
    }])

    if (erroInsercao) {
      setError('Erro ao registrar empréstimo')
      return
    }

    const { error: erroAtualizacao } = await supabase
      .from('livros')
      .update({ q_disponivel: livroDados.q_disponivel - 1 })
      .eq('id', selectedLivro.value)

    if (erroAtualizacao) {
      setError('Erro ao atualizar quantidade de livros')
      return
    }

    setDataDevolucaoFormatada(
      dataDevolucao.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    )
    setMsg('Empréstimo efetuado com sucesso.')
    setSelectedLivro(null)
  }

  const handleRedirect = () => {
    if (!usuario) return
    if (usuario.tipo === 'aluno') {
      router.push('/painel_aluno')
    } else if (usuario.tipo === 'funcionario' || usuario.tipo === 'funcionario_administrador') {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      {/* Botão voltar */}
      <button
        onClick={handleRedirect}
        disabled={!usuario}
        className={`absolute top-4 right-4 rounded-full p-2 shadow-md transition
          ${usuario ? 'bg-white text-[#006400] hover:bg-emerald-100 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 bg-[#2e8b57] rounded-[30px] p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3 drop-shadow">
          <BookOpen className="w-8 h-8" /> Cadastro de Empréstimos
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            options={options}
            value={selectedLivro}
            onChange={(option) => setSelectedLivro(option)}
            placeholder="Selecione um livro"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#006400',
                borderRadius: '9999px',
                borderColor: 'transparent',
                paddingLeft: '0.75rem',
                color: 'white',
                boxShadow: '0 0 10px rgba(0,100,0,0.5)',
              }),
              singleValue: (base) => ({
                ...base,
                color: 'white',
              }),
              placeholder: (base) => ({
                ...base,
                color: 'rgba(255, 255, 255, 0.7)',
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '15px',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#004d00' : 'white',
                color: state.isFocused ? 'white' : 'black',
                cursor: 'pointer',
              }),
            }}
          />

          <button
            type="submit"
            className="w-full bg-white text-[#006400] font-bold py-4 rounded-full hover:bg-emerald-100 transition shadow-lg"
          >
            Cadastrar
          </button>
        </form>

        {dataDevolucaoFormatada && (
          <p className="mt-6 text-center text-white font-medium">
            Data limite para devolução: <strong>{dataDevolucaoFormatada}</strong>
          </p>
        )}
      </div>
    </div>
  )
}

export default withRoleProtection(CadastroEmprestimos, ['aluno', 'funcionario', 'funcionario_administrador'])
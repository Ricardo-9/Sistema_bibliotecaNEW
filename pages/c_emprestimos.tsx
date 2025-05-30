'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withRoleProtection } from '../components/withRoleProtection'

function CadastroEmprestimos() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome_livro: '',
    nome_pessoa: '',
  })

  const [msg, setMsg] = useState<string | null>(null)
  const [dataDevolucaoFormatada, setDataDevolucaoFormatada] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ id: string; nome: string; tipo: 'aluno' | 'funcionario' } | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMsg('Usuário não autenticado')
        return
      }

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('user_id', user.id)
        .maybeSingle()

      if (aluno) {
        setUserInfo({ id: aluno.id, nome: aluno.nome, tipo: 'aluno' })
        return
      }

      const { data: funcionario } = await supabase
        .from('funcionarios')
        .select('id, nome')
        .eq('user_id', user.id)
        .maybeSingle()

      if (funcionario) {
        setUserInfo({ id: funcionario.id, nome: funcionario.nome, tipo: 'funcionario' })
        return
      }

      setMsg('Usuário não encontrado no sistema')
    }

    fetchUserInfo()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (!userInfo) {
      setMsg('Informações do usuário não carregadas')
      return
    }

    // Verifica se o nome informado bate com o nome do usuário autenticado
    if (form.nome_pessoa.trim().toLowerCase() !== userInfo.nome.trim().toLowerCase()) {
      setMsg('Você só pode fazer empréstimos em seu próprio nome.')
      return
    }

    const { data: livro, error: erroLivro } = await supabase
      .from('livros')
      .select('id, q_disponivel')
      .ilike('nome', form.nome_livro)
      .maybeSingle()

    if (erroLivro || !livro) {
      setMsg('Livro não cadastrado')
      return
    }

    if (livro.q_disponivel <= 0) {
      setMsg('Não há exemplares disponíveis')
      return
    }

    const { data: emprestimoExistente } = await supabase
      .from('emprestimos')
      .select('*')
      .eq('nome_livro', livro.id)
      .eq('solicitante_id', userInfo.id)
      .eq('tipo_solicitante', userInfo.tipo)
      .is('devolvido', null)
      .maybeSingle()

    if (emprestimoExistente) {
      setMsg('Você já possui este livro emprestado.')
      return
    }

    const dataEmprestimo = new Date()
    const dataDevolucao = new Date()
    dataDevolucao.setDate(dataEmprestimo.getDate() + 30)

    const { error: erroInsercao } = await supabase.from('emprestimos').insert([
      {
        nome_livro: livro.id,
        solicitante_id: userInfo.id,
        tipo_solicitante: userInfo.tipo,
        data_devolucao: dataDevolucao.toISOString(),
      },
    ])

    if (erroInsercao) {
      setMsg('Erro ao registrar empréstimo')
      return
    }

    const { error: erroAtualizacao } = await supabase
      .from('livros')
      .update({ q_disponivel: livro.q_disponivel - 1 })
      .eq('id', livro.id)

    if (erroAtualizacao) {
      setMsg('Erro ao atualizar quantidade de livros')
      return
    }

    setDataDevolucaoFormatada(
      dataDevolucao.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    )

    setMsg('Empréstimo efetuado com sucesso.')
    setForm({ nome_livro: '', nome_pessoa: '' })
  }

  return (
    <div>
      <h1>Cadastro de Empréstimos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome_livro">Nome do Livro: </label>
          <input
            type="text"
            name="nome_livro"
            value={form.nome_livro}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="nome_pessoa">Seu Nome: </label>
          <input
            type="text"
            name="nome_pessoa"
            value={form.nome_pessoa}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/dashboard')}
      >
        Voltar
      </button>

      {msg && <p>{msg}</p>}
      {dataDevolucaoFormatada && (
        <p>
          Data limite para devolução: <strong>{dataDevolucaoFormatada}</strong>
        </p>
      )}
    </div>
  )
}

export default withRoleProtection(CadastroEmprestimos, ['aluno', 'funcionario','funcionario_administrador'])
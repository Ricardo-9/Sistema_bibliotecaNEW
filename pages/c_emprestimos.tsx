'use client'

import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function CadastroEmprestimos() {

  const [form, setForm] = useState({
    nome_livro: "",
    nome_pessoa: "",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [dataDevolucaoFormatada, setDataDevolucaoFormatada] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const { data: livro, error: erroLivro } = await supabase
    .from('livros')
    .select('id, q_disponivel')
    .ilike('nome', form.nome_livro)
    .maybeSingle();

  const { data: usuario, error: erroUsuario } = await supabase
    .from('usuarios')
    .select('id')
    .ilike('nome', form.nome_pessoa)
    .maybeSingle();

  if (erroLivro || !livro || erroUsuario || !usuario) {
    setMsg("Livro ou usuário não cadastrado");
    setDataDevolucaoFormatada(null);
    return;
  }

  if (livro.q_disponivel <= 0) {
    setMsg("Não há livros disponíveis para empréstimo");
    setDataDevolucaoFormatada(null);
    return;
  }

  const { data: emprestimoExistente, error: erroEmprestimoExistente } = await supabase
    .from('emprestimos')
    .select('*')
    .eq('nome_livro', livro.id)
    .eq('nome_pessoa', usuario.id)
    .is('devolvido', null)
    .maybeSingle();

  if (erroEmprestimoExistente) {
    setMsg("Erro ao verificar empréstimos existentes.");
    setDataDevolucaoFormatada(null);
    return;
  }
  
  if (emprestimoExistente) {
    setMsg("Este usuário já possui um exemplar deste livro emprestado.");
    setDataDevolucaoFormatada(null);
    return;
  }

  const dataEmprestimo = new Date();
  const dataDevolucao = new Date();
  dataDevolucao.setDate(dataEmprestimo.getDate() + 30);

  const { error } = await supabase.from('emprestimos').insert([{
    nome_livro: livro.id,
    nome_pessoa: usuario.id,
    data_devolucao: dataDevolucao.toISOString(),
  }]);

  if (error) {
    setMsg("Ocorreu um erro ao cadastrar o empréstimo.");
    setDataDevolucaoFormatada(null);
    return;
  }

  const { error: erroAtualizacao } = await supabase
    .from('livros')
    .update({ q_disponivel: livro.q_disponivel - 1 })
    .eq('id', livro.id);

  if (erroAtualizacao) {
    setMsg("Ocorreu um erro ao atualizar a quantidade de livros.");
    setDataDevolucaoFormatada(null);
    return;
  }

  const devolucaoFormatada = dataDevolucao.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  setMsg("Empréstimo efetuado com sucesso.");
  setDataDevolucaoFormatada(devolucaoFormatada);
  setForm({ nome_livro: "", nome_pessoa: "" });
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
          <label htmlFor="nome_pessoa">Nome do Solicitante: </label>
          <input
            type="text"
            name="nome_pessoa"
            value={form.nome_pessoa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button type="submit">Cadastrar</button>
        </div>
      </form>

      {msg && <p>{msg}</p>}
      {dataDevolucaoFormatada && (
        <p>Data limite para devolução: <strong>{dataDevolucaoFormatada}</strong></p>
      )}
    </div>
  );
}

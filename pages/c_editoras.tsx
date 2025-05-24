'use client'

import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Cleave from "cleave.js/react";

export default function CadastroEditoras() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [msg, setMsg] = useState("");


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTelefoneChange(e: any) {
    setForm({ ...form, telefone: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.telefone.length < 15) {
      setMsg("Telefone incompleto");
      return;
    }

    const { data: editorasExistentes, error: fetchError } = await supabase
      .from('editoras')
      .select('nome')
      .eq('nome', form.nome);

    if (fetchError) {
      setMsg('Erro ao verificar editora existente: ' + fetchError.message);
      return;
    }

    if (editorasExistentes.length > 0) {
      setMsg('Já existe uma editora com esse nome cadastrado.');
      return;
    }

    const { error } = await supabase.from('editoras').insert([form]);

    if (error) {
      setMsg("Não foi possível cadastrar a editora");
    } else {
      setMsg("Cadastro concluído");
      setForm({ nome: "", email: "", telefone: "" });
    }
  }

  return (
    <div>
      <h1>Cadastro de Editoras</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          onChange={handleChange}
          value={form.nome}
          placeholder="Nome"
          required
        />
        <input
          type="email"
          name="email"
          onChange={handleChange}
          value={form.email}
          placeholder="Email"
          required
        />
        <Cleave name="telefone" onChange={handleTelefoneChange} placeholder="Telefone"
          options={{
          delimiters: ['(', ') ', '-', '-'],
          blocks: [0, 2, 5, 4],
          numericOnly: true
          }}
        />
        <button type="submit">Cadastrar</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
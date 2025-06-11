'use client'

import { useRouter } from 'next/navigation'
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { withRoleProtection } from '../components/withRoleProtection'
import Cleave from "cleave.js/react"
import Image from 'next/image'
import brasao from './imgs/Bc.png.png' // Ajuste o caminho da imagem conforme sua estrutura

function CadastroEditoras() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMsg('');
  }

  function handleTelefoneChange(e: any) {
    setForm({ ...form, telefone: e.target.value });
    setError('');
    setMsg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setMsg('');

    if (form.telefone.length < 15) {
      setError("Telefone incompleto");
      return;
    }

    const { data: editorasExistentes, error: fetchError } = await supabase
      .from('editoras')
      .select('nome')
      .eq('nome', form.nome.trim());

    if (fetchError) {
      setError('Erro ao verificar editora existente: ' + fetchError.message);
      return;
    }

    if (editorasExistentes.length > 0) {
      setError('Já existe uma editora com esse nome cadastrado.');
      return;
    }

    const { error } = await supabase.from('editoras').insert([{
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim()
    }]);

    if (error) {
      setError("Não foi possível cadastrar a editora");
    } else {
      setMsg("Cadastro concluído com sucesso!");
      setForm({ nome: "", email: "", telefone: "" });
      setTimeout(() => router.push('/dashboard2'), 1500);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] px-4 sm:px-8">
      <Image
        src={brasao}
        alt="Brasão"
        width={600}
        height={600}
        className="pointer-events-none absolute top-10 left-0 z-0 w-32 sm:w-48 md:w-72 lg:w-[580px] h-auto opacity-10"
      />

      <div className="relative z-10 bg-[#2e8b57] rounded-3xl p-8 sm:p-12 max-w-xl w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">Cadastro de Editoras</h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {msg && <p className="text-green-400 text-center mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="text"
            name="nome"
            placeholder="Nome"
            required
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
          />
          <Cleave
            className="w-full p-4 rounded-lg border-none shadow-inner focus:outline-none focus:ring-4 focus:ring-green-700 text-green-900 font-semibold"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleTelefoneChange}
            options={{
              delimiters: ['(', ') ', '-', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
            required
          />

          <button
            type="submit"
            className="w-full bg-[#006400] text-white font-bold py-4 rounded-full hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-lg"
          >
            Cadastrar
          </button>
        </form>

        <button
          className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
          onClick={() => router.push('/dashboard2')}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

export default withRoleProtection(CadastroEditoras, ['funcionario','funcionario_administrador']);

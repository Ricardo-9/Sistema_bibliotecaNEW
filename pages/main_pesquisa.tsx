
'use client'
import { useRouter } from 'next/navigation'

export default function MainPesquisa() {
  const router = useRouter()

  return (
    <div>
      <div>
        <h1>O que você quer pesquisar?</h1>
      </div>
      <div>
        <button onClick={() => router.push('/pesq_alunos')}>Alunos</button>
        <button onClick={() => router.push('/pesq_funcionarios')}>Funcionários</button>
        <button onClick={() => router.push('/pesq_editoras')}>Editoras</button>
        <button onClick={() => router.push('/pesq_livros')}>Livros</button>
        <button onClick={() => router.push('/p_emprestimos')}>Emprestimos</button>
      </div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/dashboard')}
      >
        Voltar
      </button>
    </div>
  )
}


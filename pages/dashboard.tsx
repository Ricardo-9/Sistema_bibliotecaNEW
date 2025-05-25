'use client'

import { useRouter } from 'next/navigation'
import { withRoleProtection } from '../components/withRoleProtection'

function TelaInicial() {
  const router = useRouter()

  function navegar(rota: string) {
    router.push(rota)
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Tela Inicial</h1>
      <p>Escolha uma opção:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={() => navegar('/devolucao')}>Devolução</button>
        <button onClick={() => navegar('/c_livros')}>Cadastro de Livros</button>
        <button onClick={() => navegar('/c_emprestimos')}>Cadastro de Empréstimos</button>
        <button onClick={() => navegar('/c_editoras')}>Cadastro de Editoras</button>
        <button onClick={() => navegar('/main_pesquisa')}>Pesquisa</button>
      </div>
       
    </main>
  )
}


export default withRoleProtection(TelaInicial, ['aluno', 'funcionario'])
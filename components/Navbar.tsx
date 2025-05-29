'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navegar = (rota: string) => {
    router.push(rota);
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>☰</button>

      {isOpen && (
        <div>
          <button onClick={() => setIsOpen(false)}>X</button>
          <ul>
            <li><button onClick={() => navegar('/alunos')}>Alunos</button></li>
            <li><button onClick={() => navegar('/funcionarios')}>Funcionários</button></li>
            <li><button onClick={() => navegar('/livros')}>Livros</button></li>
            <li><button onClick={() => navegar('/editoras')}>Editoras</button></li>
            <li><button onClick={() => navegar('/emprestimos')}>Empréstimos</button></li>
            <li><button onClick={() => navegar('/usuarios')}>Usuários</button></li>
            <li><button onClick={() => navegar('/')}>Início</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
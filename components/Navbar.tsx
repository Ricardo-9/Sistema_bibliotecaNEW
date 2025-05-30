'use client';
import { useState, useEffect, useState as useClientState } from 'react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useClientState(false);
  const router = useRouter();
  const [mostrarNavbar, setMostrarNavbar] = useClientState(true);

  const rotasSemNavbar = ['/login', '/signup.tsx','/signup-aluno','/signup-funcionario','/unauthorized','/reset-password','/forgot-password','/'];

  useEffect(() => {
    setMostrarNavbar(!rotasSemNavbar.includes(router.pathname));
  }, [router.pathname]);

  const navegar = (rota: string) => {
    router.push(rota);
    setIsOpen(false);
  };

  if (!mostrarNavbar) return null;

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>☰</button>

      {isOpen && (
        <div>
          <button onClick={() => setIsOpen(false)}>X</button>
          <ul>
            <li><button onClick={() => navegar('/c_editoras')}>Cadastro de editoras</button></li>
            <li><button onClick={() => navegar('/c_emprestimos')}>Cadastro de empréstimos</button></li>
            <li><button onClick={() => navegar('/c_livros')}>Cadastro de livros</button></li>
            <li><button onClick={() => navegar('/devolucao')}>Devolução</button></li>
            <li><button onClick={() => navegar('/main_pesquisa')}>Pesquisa</button></li>
            <li><button onClick={() => navegar('/')}>Tela de Início</button></li>
            <li><button onClick={() => navegar('/perfil')}>Perfil do usuário</button></li>
            <li><button onClick={() => navegar('/dashboard2')}>Dashboard</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
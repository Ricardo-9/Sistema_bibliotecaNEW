'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { X, Menu } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const [mostrarNavbar, setMostrarNavbar] = useState(true)

  const rotasSemNavbar = [
    '/',
    '/login',
    '/signup.tsx',
    '/signup-aluno',
    '/signup-funcionario',
    '/unauthorized',
    '/reset-password',
    '/forgot-password',
    '/painel_aluno',
  ]

  useEffect(() => {
    setMostrarNavbar(!rotasSemNavbar.includes(router.pathname))
  }, [router.pathname])

  const navegar = (rota: string) => {
    router.push(rota)
    setIsOpen(false)
  }

  if (!mostrarNavbar) return null

  return (
    <>
      {/* Botão de menu - só aparece quando a navbar está fechada */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-5 left-5 z-[50] bg-[#006400] text-white p-3 rounded-full shadow-lg hover:bg-[#004d00] transition duration-300"
        >
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-40 flex">
          <div className="bg-[#2e8b57] w-72 h-full p-6 rounded-r-[30px] shadow-xl text-white flex flex-col space-y-6 transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-400 transition"
              >
                <X size={28} />
              </button>
            </div>

            <nav className="flex flex-col space-y-4 text-lg">
              <button onClick={() => navegar('/c_editoras')} className="text-left hover:text-[#d4f7dc]">Cadastro de editoras</button>
              <button onClick={() => navegar('/c_emprestimos')} className="text-left hover:text-[#d4f7dc]">Cadastro de empréstimos</button>
              <button onClick={() => navegar('/c_livros')} className="text-left hover:text-[#d4f7dc]">Cadastro de livros</button>
              <button onClick={() => navegar('/devolucao')} className="text-left hover:text-[#d4f7dc]">Devolução</button>
              <button onClick={() => navegar('/main_pesquisa')} className="text-left hover:text-[#d4f7dc]">Pesquisa</button>
              <button onClick={() => navegar('/perfil')} className="text-left hover:text-[#d4f7dc]">Perfil do usuário</button>
              <button onClick={() => navegar('/dashboard')} className="text-left hover:text-[#d4f7dc]">Dashboard</button>
            </nav>

            
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Menu, X, BookOpen, User, LogOut ,Landmark ,Book ,ArrowUpDown, ChartNoAxesCombined} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const rotasSemNavbar = [
  '/',
  '/login',
  '/signup',
  '/signup-aluno',
  '/signup-funcionario',
  '/unauthorized',
  '/reset-password',
  '/forgot-password',
  '/painel_aluno',
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mostrarNavbar, setMostrarNavbar] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checarUsuario() {
      if (rotasSemNavbar.includes(router.pathname)) {
        setMostrarNavbar(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMostrarNavbar(false)
        return
      }
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      setMostrarNavbar(!aluno)
    }
    checarUsuario()
  }, [router.pathname])

  function navegar(rota: string) {
    router.push(rota)
    setIsOpen(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    setIsOpen(false)
  }

  if (!mostrarNavbar) return null

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menu"
          className="fixed top-5 left-5 z-50 bg-[#006400] text-white p-3 rounded-full shadow-lg hover:bg-[#004d00] transition"
        >
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex"
          onClick={() => setIsOpen(false)}
        >
          <nav
            className="bg-[#2e8b57] w-72 h-full p-6 rounded-r-[30px] shadow-xl text-white flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold select-none">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
                className="hover:text-red-400 transition"
              >
                <X size={28} />
              </button>
            </div>

            <nav className="flex flex-col space-y-4 text-lg font-semibold">
              <button
                onClick={() => navegar('/c_editoras')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <Landmark size={20} />
                Cadastro de editora
              </button>
              <button
                onClick={() => navegar('/c_emprestimos')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <BookOpen size={20} />
                Cadastro de empréstimo
              </button>
              <button
                onClick={() => navegar('/c_livros')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <Book size={20} />
                Cadastro de livros
              </button>
              <button
                onClick={() => navegar('/devolucao')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ArrowUpDown size={20} />
                Tela de devolução
              </button>
              <button
                onClick={() => navegar('/perfil')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <User size={20} />
                Perfil do usuário
              </button>
              <button
                onClick={() => navegar('/dashboard')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Painel Geral
              </button>
              <button
                onClick={() => navegar('/pesq_editoras')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Pesquisa de editoras
              </button>
              <button
                onClick={() => navegar('/p_emprestimos')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Pesquisa de empréstimo
              </button>
              <button
                onClick={() => navegar('/pesq_livros')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Pesquisa de livro
              </button>
              <button
                onClick={() => navegar('/pesq_alunos')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Pesquisa de aluno
              </button>
              <button
                onClick={() => navegar('/pesq_funcionario')}
                className="flex items-center gap-2 hover:text-[#d4f7dc] transition"
              >
                <ChartNoAxesCombined size={20} />
                Pesquisa de funcionário
              </button>

            </nav>

            <div className="mt-auto pt-6 border-t border-white/30">
              <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#006400] text-white font-semibold rounded-full hover:bg-[#006400] hover:text-white transition-all duration-300 shadow"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

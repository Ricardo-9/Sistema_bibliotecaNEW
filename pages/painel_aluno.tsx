'use client'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { BookOpen, Search, UserCircle, LogOut } from 'lucide-react'
import { withRoleProtection } from '../components/withRoleProtection' 

function PainelAluno() {
  const router = useRouter()

  const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/')
    }

  const acoes = [
    {
      label: 'Pegar um livro emprestado',
      icon: <BookOpen className="w-8 h-8 text-white" />,
      path: '/c_emprestimos',
    },
    {
      label: 'Ver livros disponíveis',
      icon: <Search className="w-8 h-8 text-white" />,
      path: '/pesq_livros',
    },
    {
      label: 'Ver perfil',
      icon: <UserCircle className="w-8 h-8 text-white" />,
      path: '/perfil',
    },
  ]

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10">
      <div className="bg-[#2e8b57] rounded-3xl shadow-lg w-full max-w-4xl p-10 md:p-16 text-center space-y-10">
        <h1 className="text-5xl font-bold text-white drop-shadow">Bem-vindo!</h1>
        <p className="text-lg text-gray-200">O que você gostaria de fazer?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {acoes.map(({ label, icon, path }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              className="flex flex-col items-center justify-center bg-[#006400] hover:bg-[#004d00] text-white font-semibold py-6 px-4 rounded-[2rem] transition duration-300 shadow-md hover:scale-105"
            >
              {icon}
              <span className="mt-3 text-lg">{label}</span>
            </button>
          ))}
        </div>

        <div className="pt-6">
          <button
            onClick={(handleLogout)}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#006400] text-white font-semibold rounded-full hover:bg-[#006400] hover:text-white transition-all duration-300 shadow"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

export default withRoleProtection(PainelAluno, ['aluno'])
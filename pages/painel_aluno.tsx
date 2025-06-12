'use client'
import { useRouter } from 'next/router'

export default function PainelAluno() {
  const router = useRouter()

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] overflow-hidden px-4">
      <div
        className="bg-[#2e8b57] rounded-[30px] flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64 2xl:px-96 py-20 space-y-12 max-w-screen-xl w-full shadow-lg transition-all duration-500"
        style={{ minHeight: '600px' }}
      >
        <h1 className="text-white text-4xl font-bold text-center drop-shadow-md">O que você quer fazer?</h1>

        <div className="flex flex-col items-center space-y-6 w-full">
          <button
            className="bg-[#006400] text-white text-2xl font-bold rounded-[50px] px-10 py-5 w-full max-w-md hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-md"
            onClick={() => router.push('/c_emprestimos')}
          >
            Pegar um livro emprestado
          </button>

          <button
            className="bg-[#006400] text-white text-2xl font-bold rounded-[50px] px-10 py-5 w-full max-w-md hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-md"
            onClick={() => router.push('/pesq_livros')}
          >
            Ver livros disponíveis
          </button>

          <button
            className="bg-[#006400] text-white text-2xl font-bold rounded-[50px] px-10 py-5 w-full max-w-md hover:bg-[#004d00] transition-transform transform hover:scale-105 shadow-md"
            onClick={() => router.push('/perfil')}
          >
            Ver perfil
          </button>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#006400] transition-all duration-300 shadow-md mt-6"
          onClick={() => router.push('/')}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

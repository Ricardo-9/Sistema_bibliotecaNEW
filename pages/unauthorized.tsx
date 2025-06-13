'use client'

import { useRouter } from 'next/navigation'
import { Lock, ArrowLeftCircle } from 'lucide-react'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center px-4 py-10">
      <div className="bg-[#2e8b57] text-white rounded-3xl shadow-lg w-full max-w-xl p-10 md:p-16 text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Lock className="w-12 h-12 text-red-900" />
          <h1 className="text-5xl font-bold text-red-900 drop-shadow">Acesso Negado</h1>
        </div>

        <p className="text-lg text-gray-100">
          Você não tem permissão para acessar esta página.
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#006400] font-semibold rounded-full hover:bg-[#e6e6e6] transition-all duration-300 shadow hover:scale-105"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Voltar
        </button>
      </div>
    </div>
  )
}

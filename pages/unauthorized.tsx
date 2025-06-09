'use client'

import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#006400] px-4 py-10">
      <div className="bg-[#2e8b57] text-white rounded-[30px] shadow-lg p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold drop-shadow-sm text-[#C01000]">Acesso Negado</h1>
        <p className="text-lg">Apenas funcionários têm permissão para acessar esta página.</p>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-[#006400] font-semibold px-6 py-3 rounded-[50px] hover:bg-[#f0f0f0] transition duration-300"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  )
}
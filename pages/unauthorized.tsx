'use client'

import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
      <p className="mt-4">Apenas funcionários podem acessar essa página.</p>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/dashboard')}
      >
        Voltar
      </button>
    </div>
  )
}
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const [step, setStep] = useState<'initial' | 'role'>('initial')
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo</h1>

      {step === 'initial' && (
        <>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded mb-4"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded"
            onClick={() => setStep('role')}
          >
            Cadastro
          </button>
        </>
      )}

      {step === 'role' && (
        <>
          <p className="mb-4 text-lg font-semibold">Você é:</p>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded mb-4"
            onClick={() => router.push('/signup-aluno')}
          >
            Aluno
          </button>
          <button
            className="bg-orange-500 text-white px-6 py-3 rounded"
            onClick={() => router.push('/signup-funcionario')}
          >
            Funcionário
          </button>
          <button
            className="text-blue-500 underline mt-4"
            onClick={() => setStep('initial')}
          >
            Voltar
          </button>
        </>
      )}
    </div>
  )
}
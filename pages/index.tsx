import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const [step, setStep] = useState<'initial' | 'role'>('initial')
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#006400] ">
      <div className='bg-[#2e8b57] p-96'  style={{ paddingLeft: '1500px', paddingRight: '40px', paddingTop: '20px', paddingBottom: '20px' }}>
      <h1 className="">Bem-vindo</h1>

      {step === 'initial' && (
        <>
          <button
            className="w-full max-w-xs bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition-all"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className="w-full max-w-xs bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            onClick={() => setStep('role')}
          >
            Cadastro
          </button>
        </>
      )}

      {step === 'role' && (
        <>
          <p className="text-lg font-semibold text-gray-700 mb-6">Você é:</p>
          <button
            className="w-full max-w-xs bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 transition-all"
            onClick={() => router.push('/signup-aluno')}
          >
            Aluno
          </button>
          <button
            className="w-full max-w-xs bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 transition-all"
            onClick={() => router.push('/signup-funcionario')}
          >
            Funcionário
          </button>
          <button
            className="text-blue-500 underline mt-4 hover:text-blue-600 transition-all"
            onClick={() => setStep('initial')}
          >
            Voltar
          </button>
        </>
      )}
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import brasao from './imgs/Bc.png.png'

export default function Home() {
  const [step, setStep] = useState<'initial' | 'role'>('initial')
  const router = useRouter()

  return (
    
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#006400] overflow-hidden">
  


  <div
    className="bg-[#2e8b57] rounded-[30px] flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64 2xl:px-96 space-y-12 max-w-screen-xl w-full transition-all duration-500 overflow-hidden"
    style={{ height: '700px' }}
  >
    <div className="flex flex-col items-center justify-center h-full space-y-6 sm:space-y-8">
      {step === 'initial' && (
        <>
          <button
            className="bg-[#006400] text-white rounded-[50px] text-3xl font-bold px-10 sm:px-20 md:px-[100px] lg:px-[235px] py-[35px] transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006400] shadow-md hover:bg-[#004d00]"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className="bg-[#006400] text-white text-3xl font-bold rounded-[50px] px-10 sm:px-20 md:px-[100px] lg:px-[210px] py-[35px] transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006400] shadow-md hover:bg-[#004d00]"
            onClick={() => setStep('role')}
          >
            Cadastro
          </button>
        </>
      )}

      {step === 'role' && (
        <>
          <p className="text-white text-3xl font-bold tracking-wide text-center drop-shadow-md mb-4 sm:mb-6">
            Selecione sua função:
          </p>

          <div className="flex flex-col items-center space-y-6">
            <button
              className="bg-[#006400] text-white text-3xl font-bold rounded-[50px] px-10 sm:px-20 md:px-[100px] lg:px-[229px] py-[35px] transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006400] shadow-md hover:bg-[#004d00]"
              onClick={() => router.push('/signup-aluno')}
            >
              Aluno
            </button>
            <button
              className="bg-[#006400] text-white text-3xl font-bold rounded-[50px] px-10 sm:px-20 md:px-[100px] lg:px-[187px] py-[35px] transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006400] shadow-md hover:bg-[#004d00]"
              onClick={() => router.push('/signup-funcionario')}
            >
              Funcionário
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#006400] transition-all duration-300 shadow-md mt-6"
              onClick={() => setStep('initial')}
            >
              Voltar
            </button>
          </div>
        </>
      )}
    </div>
  </div>
</div>
  )
}
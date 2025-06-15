import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export function withGuestProtection<T>(WrappedComponent: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
      const verifyUser = async () => {
        const { data } = await supabase.auth.getUser()
        const user = data?.user

        if (user) {
          const role = user.user_metadata?.role || 'aluno'

          if (role === 'funcionario_administrador') {
            router.push('/dashboard')
          } else if (role === 'funcionario') {
            router.push('/painel_funcionario')
          } else {
            router.push('/painel_aluno')
          }
        } else {
          setChecking(false)
        }
      }

      verifyUser()
    }, [router])

    if (checking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#006400]">
          <p className="text-white text-lg animate-pulse">Verificando autenticação...</p>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

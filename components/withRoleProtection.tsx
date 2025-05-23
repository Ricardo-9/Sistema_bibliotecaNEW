import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export function withRoleProtection(Component: any, allowedRoles: string[]) {
  return function ProtectedPage(props: any) {
    const router = useRouter()
    const [isAllowed, setIsAllowed] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
      const checkAccess = async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        const role = user?.user_metadata?.role

        if (!role || !allowedRoles.includes(role)) {
          router.push('/unauthorized') // página que mostra "acesso negado"
        } else {
          setIsAllowed(true)
        }

        setChecking(false)
      }

      checkAccess()
    }, [])

    if (checking) return <p>Carregando...</p>
    if (!isAllowed) return null

    return <Component {...props} />
  }
}
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export function withRoleProtection(Component: any, allowedRoles: string[]) {
  return function ProtectedPage(props: any) {
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
      const checkAccess = async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        const userRole = user?.user_metadata?.role

        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push('/unauthorized')
        } else {
          setRole(userRole)
        }

        setChecking(false)
      }

      checkAccess()
    }, [])

    if (checking) return <p>Carregando...</p>
    if (!role) return null

    return <Component {...props} role={role} />
  }
}
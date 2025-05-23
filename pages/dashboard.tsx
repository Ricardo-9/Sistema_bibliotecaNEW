import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {user && <p className="mb-4">Olá, {user.email}</p>}
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
        Sair
      </button>
    </div>
  )
}

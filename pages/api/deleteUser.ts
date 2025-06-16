import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Usuário Auth deletado com sucesso' })
}
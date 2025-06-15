'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Cleave from 'cleave.js/react'
import { UserPlus, ArrowLeft } from 'lucide-react'
export default function SignupAluno() {
 const router = useRouter()
 const [formData, setFormData] = useState({
 nome: '', cpf: '', matricula: '', endereco: '',
 email: '', telefone: '', serie: '', curso: '', senha: '',
 })
 const [error, setError] = useState('')
 const [msg, setMsg] = useState('')
 const handleChange = (e) => {
 const { name, value } = e.target
 const filteredValue = filterInput(name, value)
 setFormData({ ...formData, [name]: filteredValue })
 setError(''); setMsg('')
 }
 const filterInput = (name, value) => {
 switch (name) {
 case 'nome': return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 100)
 case 'cpf': case 'telefone': return value.replace(/\D/g, '').slice(0, 11)
 case 'matricula': return value.replace(/\D/g, '').slice(0, 7)
 case 'endereco': return value.slice(0, 150)
 case 'email': return value.slice(0, 100)
 case 'serie': return value.slice(0, 20)
 case 'curso': return value.slice(0, 50)
 case 'senha': return value.slice(0, 100)
 default: return value
 }
 }
 const handleSubmit = async (e) => {
 e.preventDefault(); setError(''); setMsg('')
 if (formData.matricula.length !== 7) return setError('A matrícula deve conter 7
dígitos.')
 if (formData.cpf.length !== 11) return setError('O CPF deve conter 11 números.')
 if (formData.telefone.length < 10) return setError('Telefone inválido.')
 const { data: currentUser } = await supabase.auth.getUser()
 const isAdmin = currentUser?.user?.user_metadata?.role ===
'funcionario_administrador'
 const { email, senha, ...dados } = formData
 const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
 email,
 password: senha,
user_metadata: { role: 'aluno' },
 })
 if (signUpError || !newUser?.user) return setError(signUpError?.message || 'Erro ao
cadastrar.')
 const { error: insertError } = await supabase.from('alunos').insert({
 ...dados,
 email,
 user_id: newUser.user.id,
 })
 if (insertError) setError(insertError.message)
 else {
 setMsg('Cadastro realizado com sucesso!')
 setTimeout(() => {
 router.push(isAdmin ? '/dashboard' : '/painel_aluno')
 }, 1500)
 }
 }
 return (/* JSX mantido igual com botão de voltar */)

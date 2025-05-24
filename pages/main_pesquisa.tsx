'use client'
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabaseClient"

export default function MainPesquisa(){

    const router_alunos = useRouter()
    const router_funcionarios = useRouter()
    const router_editoras = useRouter()
    const router_livros = useRouter()

    const Alunos= () => {
        router_alunos.push('/pesq_alunos')
    }
    const Funcionarios= () => {
        router_funcionarios.push('/pesq_funcionarios')
    }
    const Editoras= () => {
        router_funcionarios.push('/pesq_editoras')
    }
    const Livros= () => {
        router_funcionarios.push('/pesq_livros')
    }

    return(
        <div>
            <div>
            <h1>O que você quer pesquisar?</h1>
            </div>
            <div>
                <button className="border-2" value={'alunos'} onClick={Alunos}>Alunos</button>
                <button className="border-2" value={'funcionários'} onClick={Funcionarios}>Funcionários</button>
                <button className="border-2" value={'livros'} onClick={Editoras}>Editoras</button>
                <button className="border-2" value={'editoras'} onClick={Livros}>Livros</button>
            </div>
        </div>
    )
}
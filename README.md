
* Sistema de Gerenciamento de Biblioteca *

Um sistema web de gerenciamento de biblioteca, desenvolvido com Next.js, TypeScript e Supabase. Permite o cadastro e gerenciamento de livros, alunos, funcionários e empréstimos, com controle de acesso por função.

🔗 Acesse a aplicação em:
https://sistema-biblioteca-new-jba6.vercel.app/


🔧 Funcionalidades

• Cadastro e login com autenticação usando Supabase Auth.

• Sistema de permissões baseado em aluno, funcionário e administrador.

•CRUD completo para:
      Alunos
      Funcionários
      Livros
      Editoras
      Empréstimos

•Interface moderna com ícones, estilização com TailwindCSS e UX responsiva.

•Recuperação de senha via email.

•Filtros e pesquisa para empréstimos e livros.

•Interface diferenciada por tipo de usuário.




🤖 Tecnologias Utilizadas

O sistema foi desenvolvido com Next.js, um framework baseado em React que permite criar aplicações web modernas com funcionalidades de frontend e backend integradas. A linguagem utilizada é TypeScript, que traz tipagem estática ao JavaScript, oferecendo mais segurança e previsibilidade no código. O Supabase foi escolhido como backend-as-a-service, sendo responsável tanto pelo banco de dados quanto pela autenticação dos usuários. A interface do sistema foi estilizada com Tailwind CSS, garantindo um visual moderno, responsivo e com alto desempenho. Para complementar a experiência visual, foram utilizados ícones da biblioteca Lucide Icons, que oferece uma variedade de ícones leves e adaptáveis ao design da aplicação.




🔓 Controle de Acesso

O projeto conta com middleware que protege páginas específicas, exigindo autenticação e função adequada (aluno, funcionario, funcionario_administrador).

Exemplo:

export default withRoleProtection(PaginaRestrita, ['funcionario_administrador'])





💯 Próximas Melhorias

Histórico completo de empréstimos

Implementar imagens de livros e de perfil para usuário 

Responsividade completa em mobile




🧑 Autores

Desenvolvido por Ricardo Rocha Alves, e Kaiky Rodrigues de Oliveira 
📧 Contato: ricardorochaalves550@gmail.com
📧 Contato: kaikyro11@gmail.com



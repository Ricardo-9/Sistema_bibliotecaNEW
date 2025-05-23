export default function Unauthorized() {
    return (
      <div className="text-center mt-20">
        <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
        <p className="mt-4">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }
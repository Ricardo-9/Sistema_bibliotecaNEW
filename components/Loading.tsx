export default function Loading() {
  return (
    <div className="min-h-screen bg-[#006400] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-2xl font-bold">Carregando...</p>
      </div>
    </div>
  )
}

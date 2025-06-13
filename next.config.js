/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,  // ajuda a detectar problemas no React
  images: {
    unoptimized: true,    // mantém sua configuração para imagens (use se necessário)
  },
  // Removi basePath e assetPrefix para deploy no Vercel na raiz
}

module.exports = nextConfig
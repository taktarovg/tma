/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Разрешает все домены (можно уточнить позже)
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Telegram-Mini-App, Authorization' },
        ],
      },
      {
        // Добавляем CORS для кросс-доменных запросов от Telegram
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
  output: 'standalone', // Оптимизирует для Docker-деплоя
  // Конфигурация для Telegram Mini App
  experimental: {
    optimizeCss: true, // Оптимизация CSS для более быстрой загрузки
    optimizePackageImports: ['@telegram-apps/sdk', 'lucide-react'], // Оптимизация импортов пакетов
    serverComponentsExternalPackages: ['prisma', '@prisma/client'], // Внешние пакеты для серверных компонентов
  },
  // Убираем скрытые консоли для отладки
  compiler: {
    removeConsole: false, // Оставляем консоль для отладки
  },
}

module.exports = nextConfig;
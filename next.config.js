/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true, // Оптимизация CSS для более быстрой загрузки
    optimizePackageImports: ['@telegram-apps/sdk', 'lucide-react'], // Оптимизация импортов пакетов
    serverComponentsExternalPackages: ['prisma', '@prisma/client'], // Внешние пакеты для серверных компонентов
  },
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
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Telegram-Mini-App' },
        ],
      },
    ];
  },
  output: 'standalone', // Оптимизирует для Docker-деплоя
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Убедимся, что webpack использует полифиллы для Node.js модулей
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };
    return config;
  },
};

module.exports = nextConfig;
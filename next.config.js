/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Оптимизация для Vercel
  poweredByHeader: false,
  
  // Сжатие
  compress: true,
  
  // Редиректы (опционально)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/trip/example?key=demo',
        permanent: false,
      },
    ];
  },
  
  // Заголовки безопасности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
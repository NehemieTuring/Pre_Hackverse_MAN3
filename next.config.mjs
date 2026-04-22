/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://pre-hackverse-man3.onrender.com/api/:path*'
      }
    ]
  }
};

export default nextConfig;

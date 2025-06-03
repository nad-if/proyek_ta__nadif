/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pastikan tidak menggunakan Turbopack secara eksplisit
  experimental: {
    // Matikan semua fitur eksperimental yang mungkin menyebabkan konflik
  },
};

module.exports = nextConfig;

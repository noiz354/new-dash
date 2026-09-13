/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone prototypes live in web/ — never bundle them.
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Servir AVIF/WebP automáticamente en <Image> — reduce ~70% vs PNG.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Compresión gzip en el servidor.
  compress: true,
  // Menos ruido en headers.
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Quitar console.log en prod (mantiene error/warn).
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
};

export default nextConfig;

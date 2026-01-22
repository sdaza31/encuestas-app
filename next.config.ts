import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Se asume que el repo se llama encuestas-app. Si usas dominio personalizado, quita el basePath.
  basePath: isProd ? '/encuestas-app' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

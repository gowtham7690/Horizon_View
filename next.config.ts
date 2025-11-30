import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack config for mapbox-gl compatibility
  webpack: (config, { isServer }) => {
    // Fix for mapbox-gl and react-map-gl
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Handle mapbox-gl
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Ensure package exports are resolved correctly
    config.resolve.conditionNames = ['import', 'require', 'default'];

    return config;
  },
  // Turbopack config (empty for now - using webpack for mapbox-gl compatibility)
  turbopack: {},
  // Transpile mapbox-gl and react-map-gl
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

export default nextConfig;

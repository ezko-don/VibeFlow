/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Monaco Editor configuration
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });

    // Tree-sitter WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 
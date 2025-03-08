const nextConfig = {
  images: {
    domains: ['your-domain.com'], // 使用する画像のドメインを追加
  },
  webpack: (config : any) => {
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      use: 'raw-loader', // PDFワーカー用のローダー
    });

    return config;
  },
};

module.exports = nextConfig;

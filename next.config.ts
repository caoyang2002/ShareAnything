import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  
  experimental: {
    serverComponentsExternalPackages: ['ws', 'react-pdf'], // 添加 react-pdf
  },
  
  webpack: (config, { isServer }) => {
    // 保持你原有的 WebSocket 配置
    if (isServer) {
      config.externals.push('ws')
    }

    // 客户端特定配置（PDF.js 相关）
    if (!isServer) {
      // 1. 禁用 canvas 以避免 PDF.js 错误
      // 原因：PDF.js 可能尝试导入 Node.js 的 canvas 包，但在浏览器中不需要
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false, // 告诉 webpack 忽略 canvas 导入
      };

      // 2. 处理 .mjs 文件 (ES 模块)
      // 原因：PDF.js v3+ 使用 .mjs 文件，webpack 需要知道如何处理它们
      config.module.rules.push({
        test: /\.mjs$/,                    // 匹配所有 .mjs 文件
        include: /node_modules/,           // 只处理 node_modules 中的文件
        type: 'javascript/auto',           // 让 webpack 自动检测模块类型
      });

      // 3. 处理 PDF.js worker 文件
      // 原因：worker 文件需要特殊处理以正确加载
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js$/,  // 匹配 PDF worker 文件
        type: 'asset/resource',            // 作为资源文件处理
        generator: {
          filename: 'static/worker/[hash][ext][query]', // 输出路径
        },
      });

      // 4. 处理 .mjs worker 文件
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?mjs$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]',
        },
      });
    }

    // 5. 你原有的 PDF.js worker 别名 (保留但可能不再需要)
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.js',
    };

    // 6. 确保支持 ES 模块的实验性功能
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true, // 允许顶级 await
    };

    return config;
  },

  // 你原有的 rewrite 规则
  async rewrites() {
    return [
      {
        source: '/pdf.worker.js',
        destination: '/api/pdf-worker'
      }
    ];
  },

  // 可选：添加安全头部以支持 SharedArrayBuffer (提高 PDF.js 性能)
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
}

export default nextConfig
# Dockerfile
# 使用官方 Node.js 24 Alpine 镜像作为基础
FROM node:24-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置 pnpm 国内源
# RUN pnpm config set registry https://registry.npmmirror.com/

# 依赖安装阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN pnpm build

# 运行阶段
FROM base AS runner
WORKDIR /app


# 创建用户
RUN addgroup --system --gid 1001 nodejsgit 
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3456 3457
# server.js
ENV PORT=3456 
ENV HOSTNAME="0.0.0.0"
# client
ENV CLIENT_HOST="192.168.0.1"
CMD ["node", "server.js"]

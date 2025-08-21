# 构建阶段
FROM node:24-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@latest

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制源码并构建
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# 运行阶段 - 使用更小的基础镜像
FROM node:24-alpine AS runner
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache tini && rm -rf /var/cache/apk/*

# 创建用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# 只复制必要的文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3456 3457

ENV PORT=3456
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_SERVER_IP="localhost"
ENV NEXT_PUBLIC_WS_PORT=3457
ENV NEXT_PUBLIC_WEB_PORT=$PORT

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]



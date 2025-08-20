# 步骤 1: 准备项目

## 克隆或准备项目

```bash
cd ShareAnything
```

## 安装依赖

```bash
pnpm install
```

## 测试本地构建
```bash
npm run build
```

# 步骤 2: 构建 Docker 镜像

```bash
# 构建镜像
docker build -t share-anything .

# 
docker pull registry.cn-hangzhou.aliyuncs.com/library/node:22-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/library/node:22-alpine node:22-alpine

```

## 查看镜像

```bash
docker images | grep share-anything
```

# 步骤 3: 本地测试

## 运行容器

```bash
docker run -p 3000:3000 -p 8080:8080 share-anything
```

# 或者使用 docker-compose

```bash
docker-compose up --build

# 访问 http://localhost:3000 测试
步骤 4: 推送到 Docker Hub
bash# 1. 登录 Docker Hub
docker login
```

# 2. 创建标签
```bash
docker tag shared-code-editor your-dockerhub-username/shared-code-editor:latest
docker tag shared-code-editor your-dockerhub-username/shared-code-editor:v1.0.0
```

# 3. 推送镜像

```bash
docker push your-dockerhub-username/shared-code-editor:latest
docker push your-dockerhub-username/shared-code-editor:v1.0.0
```

9. 生产环境部署

```bash
使用 Docker Compose 部署
bash# 在服务器上创建 docker-compose.yml
version: '3.8'

services:
  shared-code-editor:
    image: your-dockerhub-username/shared-code-editor:latest
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - WEBSOCKET_PORT=8080
      - WEBSOCKET_HOST=0.0.0.0
    restart: unless-stopped
```

# 启动服务

```bash
docker-compose up -d
```

# 查看日志

```bash
docker-compose logs -f
```

使用 Docker 直接部署

```bash
# 拉取镜像
docker pull your-dockerhub-username/shared-code-editor:latest
```
# 运行容器
```bash
docker run -d \\
  --name shared-code-editor \\
  -p 3000:3000 \\
  -p 8080:8080 \\
  -e NODE_ENV=production \\
  -e WEBSOCKET_PORT=8080 \\
  -e WEBSOCKET_HOST=0.0.0.0 \\
  --restart unless-stopped \\
  your-dockerhub-username/shared-code-editor:latest
10. 自动化部署脚本
创建 deploy.sh 脚本：
bash#!/bin/bash
# deploy.sh

set -e

# 配置变量
DOCKER_USERNAME="your-dockerhub-username"
IMAGE_NAME="shared-code-editor"
VERSION=${1:-latest}

echo "🚀 开始部署 $IMAGE_NAME:$VERSION"

# 构建镜像
echo "📦 构建 Docker 镜像..."
docker build -t $IMAGE_NAME:$VERSION .

# 添加标签
echo "🏷️ 添加标签..."
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest

# 推送到 Docker Hub
echo "📤 推送到 Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest

echo "✅ 部署完成！"
echo "🌐 拉取命令: docker pull $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo "🔗 运行命令: docker run -p 3000:3000 -p 8080:8080 $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
使用脚本：
bash# 给脚本执行权限
chmod +x deploy.sh

# 部署最新版本
./deploy.sh

# 部署特定版本
./deploy.sh v1.0.0
11. 监控和维护
查看容器状态
bash# 查看运行中的容器
docker ps

# 查看容器日志
docker logs shared-code-editor

# 进入容器
docker exec -it shared-code-editor sh
更新应用
bash# 拉取最新镜像
docker pull your-dockerhub-username/shared-code-editor:latest

# 停止并删除旧容器
docker stop shared-code-editor
docker rm shared-code-editor

# 启动新容器
docker run -d \\
  --name shared-code-editor \\
  -p 3000:3000 \\
  -p 8080:8080 \\
  -e NODE_ENV=production \\
  --restart unless-stopped \\
  your-dockerhub-username/shared-code-editor:latest
12. 环境变量配置
创建 .env.production 文件：
env# .env.production
NODE_ENV=production
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

🔧 故障排除

常见问题

WebSocket 连接失败

检查防火墙设置，确保 8080 端口开放

验证 WebSocket URL 配置是否正确

构建失败

检查 Node.js 版本兼容性
确保所有依赖正确安装


端口冲突

更改端口映射：

```bash
-p 3001:3000 -p 8081:8080
```



```bash
docker logs shared-editor        # 查看日志
docker stats shared-editor       # 查看资源使用
docker exec -it shared-editor sh # 进入容器
```
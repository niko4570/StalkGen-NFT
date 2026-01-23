# StalkGen NFT - 梗图生成器

## 项目名称

StalkGen NFT - AI 梗图生成与 NFT 铸造平台

## 💻 项目 Repo

`https://github.com/your-username/StalkGen-NFT`

## 📌 项目简介

StalkGen NFT 是一个基于 Solana 的 AI 梗图生成与 NFT 铸造平台。用户可以通过文字描述生成个性化梗图，并一键将生成的梗图铸造为 NFT 永久保存。

该项目解决了传统梗图创作过程中创意瓶颈和作品确权的问题，通过 AI 技术降低创作门槛，同时利用 Solana 区块链的特性为创作者提供永久的数字资产所有权证明。

## 🛠️ 技术栈

### 前端

- Next.js 15 + App Router
- React 18
- Tailwind CSS v4
- shadcn/ui
- Solana Wallet Adapter
- @metaplex-foundation/js

### 后端

- Node.js + Express
- **Volcengine SDK**
- Metaplex SDK
- Solana Web3.js
- FAL AI API (bria/fibo-edit/restyle)

### 工具

- pnpm 工作区
- Solana CLI
- @solana/web3.js

## 🎬 Demo 演示

### 功能截图

- 首页：AI 梗图生成界面
- 生成结果：展示 AI 生成的梗图
- NFT 铸造：一键铸造为 Solana NFT
- 钱包集成：支持 Phantom、Solflare 等主流钱包

## 💡 核心功能

1. **AI 梗图生成**：使用 **Volcengine SDK** 生成高质量梗图
2. **图像风格转换**：通过 FAL AI API 为生成的梗图应用不同艺术风格
3. **一键 Mint NFT**：使用 Metaplex SDK 将生成的梗图铸造为 Solana NFT
4. **Solana 钱包集成**：支持主流 Solana 钱包，实现无缝铸造体验
5. **响应式设计**：适配移动端和桌面端，提供良好的用户体验

## 项目结构

```
StalkGen-NFT/
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── app/         # Next.js 15 App Router
│   │   ├── components/  # UI 组件
│   │   └── lib/         # 工具函数
│   ├── package.json     # 前端依赖
│   └── next.config.ts   # Next.js 配置
├── backend/             # 后端项目
│   ├── routes/          # API 路由
│   │   ├── fal-ai.js    # FAL AI 集成
│   │   ├── generate-meme.js  # 梗图生成（使用 Volcengine SDK）
│   │   └── mint-nft.js  # NFT 铸造
│   ├── utils/           # 工具函数
│   │   ├── volcengine_client.py  # Volcengine Python 客户端
│   │   └── volcengine_wrapper.js  # Node.js 包装器
│   ├── package.json     # 后端依赖
│   └── index.js         # Express 服务器
├── pnpm-workspace.yaml  # pnpm 工作区配置
└── .env.example         # 环境变量示例
```

## 快速开始

### 1. 安装依赖

```bash
# 根目录运行
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env` 并填写相应的环境变量：

```bash
cp .env.example .env
```

**必要环境变量**：

- `PUBLIC_SEEDREAM_API_AK`：Volcengine Access Key
- `PUBLIC_SEEDREAM_API_SK`：Volcengine Secret Key
- `HELIUS_API_KEY`：Helius API 密钥（用于元数据上传）
- `NEXT_PUBLIC_SOLANA_RPC_URL`：Solana RPC URL

### 3. 运行开发服务器

#### 前端

```bash
# 根目录运行
pnpm --filter stalkgen-frontend dev
```

#### 后端

```bash
# 根目录运行
pnpm --filter stalkgen-backend dev
```

### 4. 构建生产版本

#### 前端

```bash
pnpm --filter stalkgen-frontend build
```

#### 后端

```bash
pnpm --filter stalkgen-backend build
```

## 部署

### 前端部署到 Vercel

1. 登录 Vercel 账号
2. 选择 `Import Project`
3. 连接你的 GitHub 仓库
4. 选择 `frontend` 目录作为根目录
5. 填写环境变量 `NEXT_PUBLIC_BACKEND_URL`（指向你的后端 URL）
6. 点击 `Deploy`

### 后端部署到 Railway

1. 登录 Railway 账号
2. 选择 `New Project` → `Deploy from GitHub repo`
3. 连接你的 GitHub 仓库
4. 选择 `backend` 目录作为根目录
5. 添加环境变量：
   - `PUBLIC_SEEDREAM_API_AK`
   - `PUBLIC_SEEDREAM_API_SK`
   - `HELIUS_API_KEY`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
6. 点击 `Deploy`

## 注意事项

- 确保你有足够的 SOL 用于支付 Mint NFT 的 Gas 费用
- Volcengine API 需要付费，请确保你的账号有足够的余额
- 生产环境中请使用安全的方式存储你的密钥
- 定期检查 API 调用限额，避免超出 Volcengine API 的使用限制

## ✍️ 项目创作者

### 创作者昵称

Neo

### 创作者联系方式

- GitHub: https://github.com/your-username
- Twitter: @your-twitter-handle

### 创作者 Solana USDC 钱包地址

`Your Solana USDC Wallet Address Here`

## 许可证

MIT License

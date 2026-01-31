# StalkGen NFT - 梗图生成器

## 项目名称

StalkGen NFT - AI 梗图生成与 NFT 铸造平台

## 📌 项目简介

StalkGen NFT 是一个基于 Solana 的 AI 梗图生成与 NFT 铸造平台。用户可以通过文字描述生成个性化梗图，并一键将生成的梗图铸造为 NFT 永久保存。

该项目解决了传统梗图创作过程中创意瓶颈和作品确权的问题，通过 AI 技术降低创作门槛，同时利用 Solana 区块链的特性为创作者提供永久的数字资产所有权证明。

## 🛠️ 技术栈

### 前端

- Next.js 15 + App Router
- React 18
- Tailwind CSS v4
- Solana Wallet Adapter
- @metaplex-foundation/umi
- @metaplex-foundation/mpl-token-metadata

### 后端

- Node.js + Express
- **Volcengine SDK**
- Metaplex SDK
- Solana Web3.js

### 工具

- pnpm 工作区
- Solana CLI
- @solana/web3.js

## 🎬 Demo 演示

- if you wanna play the demo, please click [here](https://stalkgen-frontend.up.railway.app/)

- 首页：AI 梗图生成界面ee
  <img width="1688" height="722" alt="Screenshot 2026-01-25 175054" src="https://github.com/user-attachments/assets/f8bd90fe-7f10-4780-b7ae-6157c340063d" />

- 生成结果：展示 AI 生成的梗图
  <img width="1525" height="1075" alt="Screenshot 2026-01-25 175101" src="https://github.com/user-attachments/assets/dc2fef30-b87c-420f-8a13-4eeb3c2f1ebc" />

- NFT 铸造：一键铸造为 Solana NFT
  <img width="2245" height="1271" alt="Screenshot 2026-01-25 175034" src="https://github.com/user-attachments/assets/381f351c-9c62-4f63-be2a-a8bafa11a802" />

- 钱包集成：支持 Phantom、Solflare 等主流钱包
  <img width="591" height="893" alt="Screenshot 2026-01-25 175202" src="https://github.com/user-attachments/assets/a8ffc406-7de5-467d-b851-9b6d1fae6837" />

## 💡 核心功能

1. **AI 梗图生成**：使用 **Volcengine SDK** 生成高质量梗图
2. **一键 Mint NFT**：使用 Metaplex UMI 将生成的梗图铸造为 Solana NFT
3. **Solana 钱包集成**：支持 Phantom、Solflare 等主流 Solana 钱包
4. **实时余额显示**：显示钱包 SOL 余额，确保有足够资金支付铸造费用
5. **响应式设计**：适配移动端和桌面端，提供良好的用户体验

## 项目结构

```
StalkGen-NFT/
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── app/         # Next.js 15 App Router
│   │   ├── lib/         # 工具函数 (Umi 配置)
│   │   └── services/    # 前端服务层
│   ├── package.json     # 前端依赖
│   └── next.config.ts   # Next.js 配置
├── backend/             # 后端项目
│   ├── config/          # 配置管理
│   ├── routes/          # API 路由
│   │   ├── generate-meme.js    # 梗图生成
│   │   ├── mint-nft.js         # NFT 铸造
│   │   └── upload-metadata.js  # 元数据上传
│   ├── services/        # 业务逻辑层
│   │   ├── memeService.js     # 梗图生成服务
│   │   └── metadataService.js # NFT 元数据服务
│   ├── utils/           # 工具函数
│   │   ├── volcengine_signature.js  # Volcengine 签名工具
│   │   └── volcengine_wrapper.js    # Volcengine API 包装器
│   ├── package.json     # 后端依赖
│   └── index.js         # Express 服务器
├── pnpm-workspace.yaml  # pnpm 工作区配置
├── .env.example         # 环境变量示例 (含详细说明)
├── .env                 # 环境变量配置 (已加入 .gitignore)
└── README.md            # 项目文档
```

### 架构特点

1. **前后端分离**：清晰的前后端目录结构，便于独立开发和部署
2. **模块化设计**：后端采用服务层（services）封装核心业务逻辑，提高代码可维护性
3. **配置集中管理**：环境变量和配置参数集中管理，便于不同环境部署
4. **业务逻辑与路由分离**：路由层仅处理请求分发，核心业务逻辑在服务层实现
5. **数据与程序分离**：NFT 元数据上传到 Arweave，实现数据的永久存储与程序解耦

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

- `SEEDREAM_API_AK` ：Volcengine Access Key
- `SEEDREAM_API_SK` ：Volcengine Secret Key
- `HELIUS_API_KEY`：Helius API 密钥（用于元数据上传和 RPC）
- `NEXT_PUBLIC_SOLANA_RPC_URL`：Solana RPC URL
- `NEXT_PUBLIC_BACKEND_URL`：前端连接后端的 URL

**可选环境变量**：

- `VOLCENGINE_ENDPOINT`：Volcengine API 端点
- `VOLCENGINE_REGION`：Volcengine API 区域
- `PORT`：后端服务端口
- `NODE_ENV`：运行环境（开发/生产）
- `SECRET_KEY`：后端铸造钱包配置（仅在使用后端铸造时需要）

**获取环境变量**：

- Volcengine API 密钥：从 [Volcengine 控制台](https://console.volcengine.com/ark-platform/ark/apiKey) 获取
- Helius API 密钥：从 [Helius 官网](https://www.helius.xyz/) 获取
- Solana RPC URL：使用 Helius、QuickNode 或其他 Solana RPC 提供商

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
   - `SEEDREAM_API_AK` 或 `VOLCENGINE_API_AK`
   - `SEEDREAM_API_SK` 或 `VOLCENGINE_API_SK`
   - `HELIUS_API_KEY`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `NEXT_PUBLIC_BACKEND_URL`
6. 点击 `Deploy`

## 注意事项

- 确保你有足够的 SOL 用于支付 Mint NFT 的 Gas 费用（至少 0.05 SOL）
- Volcengine API 需要付费，请确保你的账号有足够的余额
- 所有环境变量都存储在 `.env` 文件中，请确保该文件已添加到 `.gitignore`
- 生产环境中请使用安全的方式存储你的密钥，如使用云服务的密钥管理服务
- 定期检查 API 调用限额，避免超出 Volcengine API 的使用限制
- 开发环境建议使用 Solana Devnet，生产环境使用 Solana Mainnet Beta

## 许可证

MIT License

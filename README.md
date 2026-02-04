# StalkGen NFT - Meme Generator

## Project Name

StalkGen NFT - AI Meme Generation and NFT Minting Platform

## 📌 Project Introduction

StalkGen NFT is a Solana-based AI meme generation and NFT minting platform. Users can generate personalized memes through text descriptions and mint the generated memes as NFTs for permanent preservation with a single click.

This project solves the problems of creative bottlenecks and work ownership verification in traditional meme creation processes. It reduces the creative threshold through AI technology while providing creators with permanent digital asset ownership proof utilizing Solana blockchain features.

## 🛠️ Technology Stack

### Frontend

- Next.js 15 + App Router
- React 18
- Tailwind CSS v4
- Solana Wallet Adapter
- @metaplex-foundation/umi
- @metaplex-foundation/mpl-token-metadata

### Backend

- Node.js + Express
- **Volcengine SDK**
- Metaplex SDK
- Solana Web3.js

### Tools

- pnpm workspace
- Solana CLI
- @solana/web3.js

## 🎬 Demo

- If you want to try the demo, please click [here](https://stalkgen-frontend.up.railway.app/)

- Homepage: AI meme generation interface
  <img width="1688" height="722" alt="Screenshot 2026-01-25 175054" src="https://github.com/user-attachments/assets/f8bd90fe-7f10-4780-b7ae-6157c340063d" />

- Generation result: Display AI-generated meme
  <img width="1525" height="1075" alt="Screenshot 2026-01-25 175101" src="https://github.com/user-attachments/assets/dc2fef30-b87c-420f-8a13-4eeb3c2f1ebc" />

- NFT minting: One-click minting as Solana NFT
  <img width="2245" height="1271" alt="Screenshot 2026-01-25 175034" src="https://github.com/user-attachments/assets/381f351c-9c62-4f63-be2a-a8bafa11a802" />

- Wallet integration: Support for Phantom, Solflare and other mainstream wallets
  <img width="591" height="893" alt="Screenshot 2026-01-25 175202" src="https://github.com/user-attachments/assets/a8ffc406-7de5-467d-b851-9b6d1fae6837" />

## 💡 Core Features

1. **AI Meme Generation**: Generate high-quality memes using **Volcengine SDK**
2. **One-click Mint NFT**: Mint generated memes as Solana NFTs using Metaplex UMI
3. **Solana Wallet Integration**: Support for Phantom, Solflare and other mainstream Solana wallets
4. **Real-time Balance Display**: Show wallet SOL balance to ensure sufficient funds for minting fees
5. **Responsive Design**: Adapt to mobile and desktop devices, providing a good user experience

## Project Structure

```
StalkGen-NFT/
├── frontend/            # Frontend project
│   ├── src/
│   │   ├── app/         # Next.js 15 App Router
│   │   ├── lib/         # Utility functions (Umi configuration)
│   │   └── services/    # Frontend service layer
│   ├── package.json     # Frontend dependencies
│   └── next.config.ts   # Next.js configuration
├── backend/             # Backend project
│   ├── config/          # Configuration management
│   ├── routes/          # API routes
│   │   ├── generate-meme.js    # Meme generation
│   │   ├── mint-nft.js         # NFT minting
│   │   └── upload-metadata.js  # Metadata upload
│   ├── services/        # Business logic layer
│   │   ├── memeService.js     # Meme generation service
│   │   └── metadataService.js # NFT metadata service
│   ├── utils/           # Utility functions
│   │   ├── volcengine_signature.js  # Volcengine signature tool
│   │   └── volcengine_wrapper.js    # Volcengine API wrapper
│   ├── package.json     # Backend dependencies
│   └── index.js         # Express server
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── .env.example         # Environment variables example (with detailed instructions)
├── .env                 # Environment variables configuration (added to .gitignore)
└── README.md            # Project documentation
```

### Architecture Features

1. **Frontend-Backend Separation**: Clear frontend and backend directory structure, facilitating independent development and deployment
2. **Modular Design**: Backend uses service layer to encapsulate core business logic, improving code maintainability
3. **Centralized Configuration Management**: Environment variables and configuration parameters are centrally managed, facilitating deployment in different environments
4. **Separation of Business Logic and Routes**: Route layer only handles request distribution, core business logic is implemented in service layer
5. **Separation of Data and Program**: NFT metadata is uploaded to Arweave, achieving permanent storage of data and decoupling from program

## Quick Start

### 1. Install Dependencies

```bash
# Run in root directory
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` file to `.env` and fill in the corresponding environment variables:

```bash
cp .env.example .env
```

**Required Environment Variables**:

- `SEEDREAM_API_AK` : Volcengine Access Key
- `SEEDREAM_API_SK` : Volcengine Secret Key
- `HELIUS_API_KEY`: Helius API key (for metadata upload and RPC)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC URL
- `NEXT_PUBLIC_BACKEND_URL`: URL for frontend to connect to backend

**Optional Environment Variables**:

- `VOLCENGINE_ENDPOINT`: Volcengine API endpoint
- `VOLCENGINE_REGION`: Volcengine API region
- `PORT`: Backend service port
- `NODE_ENV`: Running environment (development/production)
- `SECRET_KEY`: Backend minting wallet configuration (only needed when using backend minting)

**Obtaining Environment Variables**:

- Volcengine API keys: Get from [Volcengine Console](https://console.volcengine.com/ark-platform/ark/apiKey)
- Helius API key: Get from [Helius website](https://www.helius.xyz/)
- Solana RPC URL: Use Helius, QuickNode or other Solana RPC providers

### 3. Run Development Server

#### Frontend

```bash
# Run in root directory
pnpm --filter stalkgen-frontend dev
```

#### Backend

```bash
# Run in root directory
pnpm --filter stalkgen-backend dev
```

### 4. Build Production Version

#### Frontend

```bash
pnpm --filter stalkgen-frontend build
```

#### Backend

```bash
pnpm --filter stalkgen-backend build
```

## Deployment

### Deploy Frontend to Vercel

1. Log in to Vercel account
2. Select `Import Project`
3. Connect your GitHub repository
4. Select `frontend` directory as root directory
5. Fill in environment variable `NEXT_PUBLIC_BACKEND_URL` (pointing to your backend URL)
6. Click `Deploy`

### Deploy Backend to Railway

1. Log in to Railway account
2. Select `New Project` → `Deploy from GitHub repo`
3. Connect your GitHub repository
4. Select `backend` directory as root directory
5. Add environment variables:
   - `SEEDREAM_API_AK` or `VOLCENGINE_API_AK`
   - `SEEDREAM_API_SK` or `VOLCENGINE_API_SK`
   - `HELIUS_API_KEY`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `NEXT_PUBLIC_BACKEND_URL`
6. Click `Deploy`

## Notes

- Ensure you have enough SOL to pay for NFT minting gas fees (at least 0.05 SOL)
- Volcengine API requires payment, please ensure your account has sufficient balance
- All environment variables are stored in `.env` file, please ensure this file is added to `.gitignore`
- In production environment, please use secure methods to store your keys, such as using cloud service's key management service
- Regularly check API call limits to avoid exceeding Volcengine API usage limits
- It is recommended to use Solana Devnet for development environment and Solana Mainnet Beta for production environment

## License

MIT License

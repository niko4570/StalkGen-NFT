<div align="center">

# StalkGen NFT

AI-powered cyberpunk meme studio that turns prompts into Solana NFTs in one flow.

[Live Demo](https://stalkgen-frontend.up.railway.app/) · [Report Issue](https://github.com/your-org/StalkGen-NFT/issues)

</div>

## ✨ Overview

StalkGen NFT combines Volcengine Jimeng 4.0 image generation with the Solana + Metaplex NFT stack. The frontend (Next.js App Router) guides users from prompt to pixel art preview, while the backend (Express on Vercel/Railway) handles high-trust operations such as AI generation jobs and optional custodial minting. Metadata is persisted on Arweave through the Irys uploader so every meme can live forever on-chain.

### 🎬 Demo Shots

- Landing view: prompt entry + wallet panel  
  <img width="1688" height="722" alt="Homepage" src="https://github.com/user-attachments/assets/f8bd90fe-7f10-4780-b7ae-6157c340063d" />
- Meme preview: Volcengine output rendered in pixel-perfect frame  
  <img width="1525" height="1075" alt="Result" src="https://github.com/user-attachments/assets/dc2fef30-b87c-420f-8a13-4eeb3c2f1ebc" />
- Mint confirmation: Solscan + transaction signature sharing  
  <img width="2245" height="1271" alt="Mint" src="https://github.com/user-attachments/assets/381f351c-9c62-4f63-be2a-a8bafa11a802" />
- Wallet modal: Phantom, Solflare, more via Solana Wallet Adapter  
  <img width="591" height="893" alt="Wallet" src="https://github.com/user-attachments/assets/a8ffc406-7de5-467d-b851-9b6d1fae6837" />

## 💡 Core Features

- **AI Meme Fabrication** – `backend/routes/generate-meme.js` fans out prompts to Volcengine Jimeng 4.0, handles async polling, and normalizes the returned image URLs/base64.
- **Wallet-Gated NFT Minting** – `frontend/src/services/nftService.ts` uploads metadata with the connected wallet signature (Umi + Irys) and mints using `@metaplex-foundation/mpl-token-metadata`.
- **Custodial Mint Option** – `backend/routes/mint-nft.js` can mint via a backend signer (set `SECRET_KEY`) for use cases that require server-side control.
- **Dynamic API Routing** – `frontend/src/lib/api-url.ts` automatically switches between `API_INTERNAL_URL` (Railway private network) and the public `NEXT_PUBLIC_BACKEND_URL`.
- **Resilient Ops** – CORS allow-listing, health checks, granular error surfaces, SOL balance guards, and retry-aware Volcengine wrapper keep UX predictable.

## 🧱 Tech Stack

| Layer    | Highlights                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 15 App Router · React 18 · Tailwind CSS · Solana Wallet Adapter · Metaplex Umi + Irys uploader (web)  |
| Backend  | Node 20 · Express · Volcengine Official SDK (`@volcengine/openapi`) · Umi server bundle for custodial minting |
| Tooling  | pnpm workspaces · TypeScript · Solana CLI / Helius RPC · Railway + Vercel friendly configs                    |

## 🗂️ Repository Layout

```
StalkGen-NFT/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Prompt → preview → mint flow
│   │   └── providers.tsx         # Wallet + connection providers
│   ├── src/components/ui/        # Cyberpunk panels, preview frames, pixel buttons
│   ├── src/lib/{api-url,umi}.ts  # API routing + Umi factory
│   └── src/services/             # memeService & nftService client helpers
├── backend/
│   ├── index.js                  # Express app (serverless friendly)
│   ├── config/config.js          # Centralized env management + validation
│   ├── routes/
│   │   ├── generate-meme.js
│   │   ├── mint-nft.js
│   │   └── upload-metadata.js
│   ├── services/memeService.js   # Prompt validation + Volcengine orchestration
│   └── utils/
│       ├── metadataService.js    # Arweave uploads via Umi (server)
│       └── volcengine_wrapper.js # Signed Jimeng 4.0 requests + polling
├── pnpm-workspace.yaml
├── pnpmfile.cjs                  # Workspace-level patching/overrides
├── .env.example
└── README.md
```

## ✅ Prerequisites

- Node.js ≥ 20 + pnpm ≥ 10 (root `packageManager` lock)
- Solana CLI (for devnet airdrops and wallet inspection)
- Volcengine Jimeng 4.0 API access + Helius RPC key
- Optional: Vercel / Railway accounts for deployment

## 🚀 Quick Start

```bash
git clone https://github.com/your-org/StalkGen-NFT.git
cd StalkGen-NFT
pnpm install
cp .env.example .env
# fill in API keys + RPC endpoints

# run everything (uses workspace filters under the hood)


# or run separately
pnpm --filter stalkgen-frontend dev
pnpm --filter stalkgen-nft-backend dev
```

The backend boots on `PORT` (default `3005`). The frontend expects `NEXT_PUBLIC_BACKEND_URL=http://localhost:3005` during local development.

## 🔐 Environment Variables

`.env.example` lives at repo root and is loaded for both packages. Key settings:

| Variable                                   | Purpose                                                    | Required                 |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SOLANA_RPC_URL`               | Wallet connection + Umi RPC endpoint (devnet/mainnet)      | ✅ frontend              |
| `NEXT_PUBLIC_IRYS_URL`                     | Irys uploader endpoint (usually `https://devnet.irys.xyz`) | ✅ frontend              |
| `SEEDREAM_API_AK`, `SEEDREAM_API_SK`       | Volcengine Jimeng API credentials used by backend          | ✅ backend               |
| `VOLCENGINE_ENDPOINT`, `VOLCENGINE_REGION` | Optional overrides for different Volcengine regions        | optional                 |
| `HELIUS_API_KEY`                           | Used by backend for metadata uploads / RPC fallbacks       | ✅ backend               |
| `NEXT_PUBLIC_BACKEND_URL`                  | Public-facing backend URL consumed by browser              | ✅ frontend              |
| `API_INTERNAL_URL`                         | Private backend URL for SSR / Railway service links        | optional but recommended |
| `PORT`, `NODE_ENV`                         | Backend server configuration                               | optional                 |
| `SECRET_KEY`                               | Base58 signer for custodial minting (server-side)          | optional                 |
| `FRONTEND_URL`, `NEXT_PUBLIC_FRONTEND_URL` | Extra domains for CORS allow list                          | optional                 |

> Tip: keep `.env` at repo root so both `backend/config/config.js` and the Next.js runtime can hydrate shared secrets.

## 🧪 Available Scripts

| Location | Command                                 | Description                                           |
| -------- | --------------------------------------- | ----------------------------------------------------- |
| root     | `pnpm dev`                              | Runs `frontend` and `backend` dev servers in parallel |
| frontend | `pnpm dev` / `build` / `start` / `lint` | Standard Next.js commands                             |
| backend  | `pnpm dev`                              | Nodemon-style watch (`node --watch index.js`)         |
| backend  | `pnpm start`                            | Production-style start (use for Railway)              |

## 🧬 API Surface

| Method | Endpoint               | Description                                                                                  |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------- |
| `GET`  | `/api/health`          | Basic uptime + env echo (used by Vercel/Railway health checks)                               |
| `POST` | `/api/generate-meme`   | Body `{ prompt, negative_prompt?, size? }`; proxies to Volcengine and returns `{ imageUrl }` |
| `POST` | `/api/upload-metadata` | Accepts pre-built metadata JSON; uploads via Irys and returns `metadata_uri`                 |
| `POST` | `/api/mint-nft`        | Custodial mint that uploads metadata + mints NFT with backend signer                         |

Frontend clients should prefer local minting through `nftService.mintNft` so NFTs are signed by the connected wallet. The custodial endpoint is intended for automation or server-triggered drops.

## 🔄 Prompt → NFT Flow

1. User enters prompt in `GenerateNFTPanel`; `memeService.generateMeme()` calls backend `/api/generate-meme`.
2. `memeService` validates prompt, clamps sizes, then submits/polls Volcengine via `volcengine_wrapper.js`.
3. Once the image URL is returned, the preview component renders it and the wallet panel unlocks the mint step.
4. `nftService.mintNft()`
   - Confirms SOL balance ≥ 0.05 via `Connection.getBalance()`.
   - Builds metadata, uploads JSON using Umi + Irys (wallet signs the request).
   - Calls `createNft()` with wallet identity to mint on Solana.
   - Returns mint address + Solscan link for sharing.

## 🚢 Deployment Notes

### Frontend (Vercel)

1. Import repo → set root to `frontend`.
2. Add env vars: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_IRYS_URL`, `NEXT_PUBLIC_HELIUS_API_KEY`.
3. Optional: configure `NEXT_PUBLIC_BACKEND_URL` to Railway backend domain (https://your-backend.up.railway.app).

### Backend (Railway / Vercel Functions)

1. Point service root to `backend/`.
2. Provide Volcengine + Helius keys plus `FRONTEND_URL`/`NEXT_PUBLIC_FRONTEND_URL` for CORS.
3. Railway automatically injects `API_INTERNAL_URL`; hook it up to the frontend environment for SSR.
4. If using custodial minting, set `SECRET_KEY` (base58). On devnet you can omit and let the server generate + airdrop a keypair.

## 🆘 Troubleshooting

- **502 / Bad Gateway from Volcengine** – The provider is throttling or down. The backend already returns a descriptive error, simply retry later.
- **“API keys not configured”** – Ensure `.env` is loaded in both packages (run dev from repo root). `backend/config/config.js` validates keys on boot.
- **“Wallet does not have sufficient permissions”** – The Solana adapter did not expose `signTransaction`. Reconnect in Phantom/Solflare or switch browsers.
- **“Insufficient SOL (need 0.05)”** – Grab Devnet SOL via `solana airdrop 1 <wallet>` or Helius faucet before minting.
- **CORS blocked** – Update `FRONTEND_URL`/`NEXT_PUBLIC_FRONTEND_URL` to include both protocol and bare domain, matching what the browser sends.

## 📄 License

MIT License © StalkGen Contributors

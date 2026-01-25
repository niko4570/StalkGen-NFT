"use client";

/**
 * Umi Configuration Utility
 *
 * Provides Umi instance creation and configuration for Solana blockchain interaction
 * - Integrates Solana Wallet Adapter
 * - Configures MPL Token Metadata program
 * - Configures Irys uploader for metadata storage
 */

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys/web";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Create and configure Umi instance
 *
 * Umi is a Solana development framework provided by Metaplex that simplifies blockchain interaction
 * This function configures necessary plugins and wallet integration for NFT minting and metadata management
 *
 * @param wallet - Wallet context state from useWallet hook
 * @returns Configured Umi instance ready for blockchain operations
 */
export const createUmiInstance = (wallet: WalletContextState) => {
  // Get Solana RPC endpoint, prioritize environment variable, default to Devnet
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

  // Get Irys uploader endpoint for metadata storage
  const irysUrl = process.env.NEXT_PUBLIC_IRYS_URL || "https://devnet.irys.xyz";

  // Create Umi instance and configure plugins
  const umi = createUmi(rpcUrl)
    // Load MPL Token Metadata program for NFT metadata management
    .use(mplTokenMetadata())
    // Configure Irys uploader to upload NFT metadata to Arweave
    .use(
      irysUploader({
        address: irysUrl,
      }),
    );

  // Add wallet adapter identity if wallet is connected
  if (wallet.connected && wallet.wallet && wallet.wallet.adapter) {
    umi.use(walletAdapterIdentity(wallet.wallet.adapter));
  }

  return umi;
};

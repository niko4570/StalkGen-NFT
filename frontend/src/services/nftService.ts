"use client";

/**
 * NFT Minting Service
 *
 * Encapsulates the core business logic for minting NFTs on Solana
 */

import { Connection, PublicKey } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { createUmiInstance } from "../lib/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

interface MintNftParams {
  wallet: WalletContextState;
  imageUrl: string;
  prompt: string;
}

interface MintNftResult {
  mintAddress: string;
  solscanLink: string;
}

class NftService {
  private connection: Connection;

  constructor() {
    // Use reliable RPC endpoint
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    this.connection = new Connection(rpcUrl, "confirmed");
  }

  /**
   * Check wallet balance
   * @param publicKey - Wallet public key
   * @returns {Promise<number>} SOL balance
   */
  async checkBalance(publicKey: PublicKey): Promise<number> {
    const lamports = await this.connection.getBalance(publicKey);
    return lamports / 1e9; // Convert to SOL
  }

  /**
   * Create NFT metadata
   * @param params - Metadata parameters
   * @returns {Object} NFT metadata
   */
  createMetadata(params: {
    imageUrl: string;
    prompt: string;
    walletPublicKey: PublicKey;
  }) {
    const { imageUrl, prompt, walletPublicKey } = params;
    const timestamp = Math.floor(Date.now() / 1000);
    const shortPrompt =
      prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt;

    return {
      name: `Meme: ${shortPrompt}`,
      description: `A meme generated from prompt: ${prompt}`,
      image: imageUrl,
      attributes: [
        { trait_type: "Meme Type", value: "Generated" },
        { trait_type: "Timestamp", value: timestamp.toString() },
        { trait_type: "Prompt", value: prompt },
      ],
      external_url: "https://github.com/solana-labs/solana",
      seller_fee_basis_points: 500,
      creators: [
        {
          address: walletPublicKey.toBase58(),
          verified: false,
          share: 100,
        },
      ],
    };
  }

  /**
   * Upload metadata to Arweave using Umi + Irys (web version)
   * @param metadata - NFT metadata
   * @param wallet - Wallet context state
   * @returns {Promise<string>} Metadata URI
   */
  async uploadMetadata(
    metadata: ReturnType<typeof this.createMetadata>,
    wallet: WalletContextState,
  ): Promise<string> {
    console.log("Uploading metadata to Arweave using Umi + Irys web...");
    const umi = createUmiInstance(wallet);
    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("Metadata uploaded successfully:", metadataUri);
    return metadataUri;
  }

  /**
   * Mint NFT using Umi + mpl-token-metadata
   * @param params - Mint parameters
   * @returns {Promise<MintNftResult>} Mint result
   */
  async mintNft(params: MintNftParams): Promise<MintNftResult> {
    const { wallet, imageUrl, prompt } = params;

    if (!wallet.publicKey || !wallet.wallet || !wallet.wallet.adapter) {
      throw new Error("Wallet not properly connected");
    }

    // Create NFT metadata
    const nftMetadata = this.createMetadata({
      imageUrl,
      prompt,
      walletPublicKey: wallet.publicKey,
    });

    // Upload metadata to Arweave (frontend using wallet signature)
    const metadataUri = await this.uploadMetadata(nftMetadata, wallet);

    // Mint NFT using Umi + mpl-token-metadata
    console.log("Minting NFT using Umi + mpl-token-metadata...");
    const umi = createUmiInstance(wallet);
    const mint = generateSigner(umi);

    // Create NFT
    const transaction = await createNft(umi, {
      mint,
      name: nftMetadata.name,
      symbol: "MEME",
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(5), // 5%
      creators: [
        {
          address: publicKey(wallet.publicKey.toBase58()),
          verified: false,
          share: 100,
        },
      ],
    }).sendAndConfirm(umi);

    // Build Solscan link
    const mintAddress = mint.publicKey;
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const cluster = rpcUrl.includes("devnet") ? "devnet" : "mainnet";
    const solscanLink = `https://solscan.io/token/${mintAddress}?cluster=${cluster}`;

    console.log("NFT minted successfully!");
    console.log("Mint address:", mintAddress);
    console.log("Solscan link:", solscanLink);

    return {
      mintAddress: mintAddress.toString(),
      solscanLink,
    };
  }

  /**
   * Validate minimum balance for minting
   * @param balance - SOL balance
   * @returns {boolean} True if balance is sufficient
   */
  validateMinimumBalance(balance: number): boolean {
    return balance >= 0.05; // Minimum 0.05 SOL required for minting
  }
}

export const nftService = new NftService();

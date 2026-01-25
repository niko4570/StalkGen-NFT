"use client";

/**
 * StalkGen NFT Main Page Component
 *
 * Provides a complete user interface for AI meme generation and NFT minting
 * - Wallet connection and balance display
 * - AI meme generation
 * - NFT minting and transaction lookup
 */

import { useState, useEffect } from "react";
import { Image, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { memeService } from "../services/memeService";
import { nftService } from "../services/nftService";
import { logApiUrlConfig } from "../lib/api-url";

/**
 * NFT Metadata Interface
 */
interface Metadata {
  imageUrl: string; // Image URL
  prompt: string; // Prompt used to generate the image
}

/**
 * StalkGen NFT Main Page Component
 */
export default function Home() {
  const wallet = useWallet(); // Solana wallet context

  // State management
  const [prompt, setPrompt] = useState(""); // AI generation prompt
  const [imageUrl, setImageUrl] = useState(""); // Generated image URL
  const [loading, setLoading] = useState(false); // Meme generation loading state
  const [mintLoading, setMintLoading] = useState(false); // NFT minting loading state
  const [error, setError] = useState(""); // Error message
  const [nftMinted, setNftMinted] = useState(false); // Whether NFT was successfully minted
  const [nftAddress, setNftAddress] = useState(""); // Minted NFT address
  const [solscanLink, setSolscanLink] = useState(""); // Solscan transaction lookup link

  // Balance related states
  const [balance, setBalance] = useState<number>(0); // Wallet SOL balance
  const [balanceLoading, setBalanceLoading] = useState(false); // Balance loading state

  // Client-side rendering flag to resolve hydration mismatch issues
  const [isClient, setIsClient] = useState(false);

  /**
   * Check wallet SOL balance
   *
   * @returns {Promise<void>} No return value, updates balance state
   */
  const checkBalance = async () => {
    if (!wallet.publicKey) return;

    setBalanceLoading(true);
    try {
      const solBalance = await nftService.checkBalance(wallet.publicKey);
      setBalance(solBalance);
      console.log("Wallet balance:", solBalance, "SOL");
    } catch (err) {
      console.error("Error checking balance:", err);
      setError(
        "Failed to check balance, please ensure network connection is normal",
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  /**
   * Automatically check balance when wallet connection status changes
   */
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      checkBalance();
    } else {
      // Reset balance if wallet is disconnected
      setBalance(0);
    }
  }, [wallet.connected, wallet.publicKey]);

  /**
   * Mark component as client-side rendered to resolve hydration mismatch issues
   * and log API URL configuration for debug purposes
   */
  useEffect(() => {
    setIsClient(true);

    // 🐛 Debug logging: Check if Railway has correctly injected the URL variables
    // This will log both public and internal URLs to the console
    logApiUrlConfig();

    // Log individual environment variables for verification
    console.log("🔍 Environment Variables:");
    console.log("   NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("   API_INTERNAL_URL:", process.env.API_INTERNAL_URL);
  }, []);

  /**
   * Generate meme using AI
   *
   * @returns {Promise<void>} No return value, updates image URL state
   */
  const generateMeme = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setNftMinted(false);

    try {
      // Generate meme using memeService
      const result = await memeService.generateMeme({
        prompt,
        negative_prompt: "",
        size: "1024x1024",
      });

      console.log("Image generated successfully:", result.imageUrl);
      setImageUrl(result.imageUrl);
    } catch (err) {
      console.error("Error generating meme:", err);

      // Provide friendly error message and solutions
      let errorMessage = "Error generating meme: ";
      if (err instanceof Error) {
        errorMessage += err.message;

        // Provide specific solutions for different API errors
        if (
          err.message.includes("502") ||
          err.message.includes("Bad Gateway")
        ) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage +=
            "1. Please try again later, Volcengine API is temporarily unavailable\n";
          errorMessage += "2. Check if network connection is normal\n";
          errorMessage += "3. Try using a simpler prompt\n";
        } else if (err.message.includes("API keys")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage +=
            "1. Please contact administrator to configure API keys\n";
          errorMessage +=
            "2. Ensure backend server has correctly set environment variables\n";
        } else if (err.message.includes("timeout")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage += "1. Please use a shorter prompt\n";
          errorMessage += "2. Check if network connection is stable\n";
          errorMessage += "3. Try again later\n";
        } else if (err.message.includes("API error")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage += "1. Ensure backend server is running\n";
          errorMessage +=
            "2. Check if Seedream API keys are correctly configured in .env file\n";
          errorMessage +=
            "3. Ensure environment variable names in backend are correct\n";
          errorMessage +=
            "4. Restart backend server to load latest environment variables\n";
        }
      } else {
        errorMessage += "Unknown error";
      }

      errorMessage += " 💥";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mint the generated meme as NFT
   *
   * @returns {Promise<void>} No return value, updates NFT minting state
   */
  const mintNFT = async () => {
    // Validate preconditions
    if (!wallet.publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!imageUrl) {
      setError("Please generate a meme first");
      return;
    }

    // Check if balance is sufficient for minting fees
    if (!nftService.validateMinimumBalance(balance)) {
      const errorMsg =
        "Your SOL balance is insufficient. You need at least 0.05 SOL to pay for minting fees (including Mint account creation fees). Please get more Devnet SOL and try again.";
      console.error(errorMsg, { currentBalance: balance });
      setError(errorMsg);
      return;
    }

    // Check wallet permissions
    if (!wallet.signTransaction) {
      const errorMsg =
        "Wallet does not have sufficient permissions to sign transactions. Please ensure wallet is fully connected.";
      console.error(errorMsg, { wallet: wallet.publicKey?.toBase58() });
      setError(errorMsg);
      return;
    }

    setMintLoading(true);
    setError("");

    try {
      // Mint NFT using nftService
      const mintResult = await nftService.mintNft({
        wallet,
        imageUrl,
        prompt,
      });

      console.log("NFT minted successfully!");
      console.log("Mint address:", mintResult.mintAddress);
      console.log("Solscan link:", mintResult.solscanLink);

      // Update NFT minting state
      setNftAddress(mintResult.mintAddress);
      setSolscanLink(mintResult.solscanLink);
      setNftMinted(true);
      localStorage.setItem("lastSolscanLink", mintResult.solscanLink);
    } catch (error) {
      console.error("Error minting NFT:", error);

      // Provide detailed error message and solutions
      let errorMessage = "Error minting NFT 💥\n\n";

      if (error instanceof Error) {
        errorMessage += `Error details: ${error.message}\n\n`;

        // Provide specific solutions based on error type
        if (error.message.includes("User rejected the request")) {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Please ensure you have authorized wallet to sign transaction\n";
          errorMessage +=
            "2. Please check wallet popup and ensure you have clicked confirm button\n";
          errorMessage +=
            "3. If you accidentally rejected the request, please try minting again\n";
        } else if (error.message.includes("AccountNotFoundError")) {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Ensure you are using the correct network (Solana Devnet)\n";
          errorMessage +=
            "2. Ensure wallet has sufficient Devnet SOL (at least 0.05 SOL)\n";
          errorMessage +=
            "3. Please try refreshing the page, reconnecting wallet, then try minting again\n";
          errorMessage +=
            "4. Please ensure your wallet is fully synchronized to Devnet network\n";
          errorMessage +=
            "5. Try using another Devnet RPC endpoint, current RPC may be unstable\n";
          errorMessage +=
            "6. Try again later, transaction may not be confirmed due to network congestion\n";
        } else if (error.message.includes("Failed to upload metadata")) {
          errorMessage += "Solutions:\n";
          errorMessage += "1. Check if metadata format is correct\n";
          errorMessage +=
            "2. Ensure image URL is accessible and format is correct\n";
          errorMessage +=
            "3. Try again later, may be network connection issue\n";
        } else {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Ensure wallet is connected and has sufficient SOL for gas fees\n";
          errorMessage += "2. Check if network connection is normal\n";
          errorMessage +=
            "3. Ensure you have authorized wallet to sign transaction\n";
          errorMessage +=
            "4. Try again later, may be network congestion or service temporarily unavailable\n";
        }
      } else {
        errorMessage += `Unknown error: ${String(error)}\n\n`;
        errorMessage += "Solutions:\n";
        errorMessage +=
          "1. Ensure wallet is connected and has sufficient SOL for gas fees\n";
        errorMessage += "2. Check if network connection is normal\n";
        errorMessage +=
          "3. Ensure you have authorized wallet to sign transaction\n";
        errorMessage +=
          "4. Try again later, may be network congestion or service temporarily unavailable\n";
      }

      setError(errorMessage);
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎨 StalkGen NFT</h1>
          {/* 只在客户端渲染WalletMultiButton组件，避免hydration mismatch */}
          {isClient && (
            <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" />
          )}
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          AI 生成梗图并一键 Mint 为 NFT
        </p>

        {wallet.publicKey && (
          <div className="mt-4 text-center text-sm text-gray-500 mb-6">
            <div className="mb-2">
              已连接钱包: {wallet.publicKey.toBase58().substring(0, 6)}...
              {wallet.publicKey.toBase58().substring(38)}
            </div>
            <div>
              {balanceLoading ? (
                <span>正在检查余额...</span>
              ) : (
                <span>余额: {balance.toFixed(6)} SOL</span>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你的梗图提示词，例如：一只猫在电脑前编程"
            className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={generateMeme}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              生成中...
            </>
          ) : (
            "生成梗图"
          )}
        </button>

        {imageUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">生成结果</h2>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
                  size={24}
                />
                <img
                  src={imageUrl}
                  alt="Generated Meme"
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={mintNFT}
                disabled={mintLoading || !wallet.publicKey}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {mintLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    铸造中...
                  </>
                ) : !wallet.publicKey ? (
                  "请先连接钱包"
                ) : (
                  "Mint 为 NFT"
                )}
              </button>
            </div>

            {nftMinted && (
              <div className="mt-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg">
                <h3 className="font-bold">NFT Mint 成功！</h3>
                <p className="mt-2">Mint 地址: {nftAddress}</p>
                <p className="mt-2 text-sm">
                  <a
                    href={
                      solscanLink ||
                      `https://solscan.io/token/${nftAddress}?cluster=devnet`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    在 Solscan 上查看
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>StalkGen NFT - 用 AI 创造你的专属梗图 NFT</p>
      </footer>
    </div>
  );
}

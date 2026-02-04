"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { memeService } from "../services/memeService";
import { nftService } from "../services/nftService";
import { CyberpunkPanel } from "../components/ui/CyberpunkPanel";
import { GenerateNFTPanel } from "../components/ui/GenerateNFTPanel";
import { NFTPreviewPanel } from "../components/ui/NFTPreviewPanel";
import { WalletProviderWrapper } from "./providers";

// Reusable component: Neon Title
const NeonTitle = ({ children }: { children: React.ReactNode }) => (
  <h1
    className="text-7xl md:text-8xl lg:text-9xl font-bold glitch neon-text"
    data-text={String(children)}
    aria-label={String(children)}
    style={{
      textShadow:
        "0 0 15px #9966ff, 0 0 30px #9966ff, 0 0 45px #9966ff, 0 0 60px #9966ff, 0 0 75px #9966ff",
      color: "#ffffff",
      letterSpacing: "2px",
    }}
  >
    {children}
  </h1>
);

// Reusable component: Pixel Preview
const PixelPreview = ({ imageUrl }: { imageUrl: string }) => (
  <div className="relative">
    <img
      src={imageUrl}
      alt="Generated NFT"
      className="w-full h-full object-contain image-rendering-pixelated"
      aria-label="Generated NFT preview"
    />
  </div>
);

function HomeContent() {
  const wallet = useWallet();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [error, setError] = useState("");
  const [nftMinted, setNftMinted] = useState(false);
  const [nftAddress, setNftAddress] = useState("");
  const [solscanLink, setSolscanLink] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [style, setStyle] = useState("cyberpunk");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkBalance = async () => {
    if (!isClient || !wallet.publicKey) return;

    setBalanceLoading(true);
    try {
      const solBalance = await nftService.checkBalance(wallet.publicKey);
      setBalance(solBalance);
    } catch (err) {
      console.error("Error checking balance:", err);
      setError(
        "Failed to check balance, please ensure network connection is normal",
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && wallet.connected && wallet.publicKey) {
      checkBalance();
    } else {
      setBalance(0);
    }
  }, [isClient, wallet.connected, wallet.publicKey]);

  const generateMeme = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setNftMinted(false);

    try {
      const result = await memeService.generateMeme({
        prompt,
        negative_prompt: "",
        size: "1024x1024",
      });

      console.log("Image generated successfully:", result.imageUrl);
      setImageUrl(result.imageUrl);
    } catch (err) {
      console.error("Error generating meme:", err);

      let errorMessage = "Error generating meme: ";
      if (err instanceof Error) {
        errorMessage += err.message;

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

  const mintNFT = async () => {
    if (!isClient) {
      setError("Please connect your wallet first");
      return;
    }

    if (!wallet.publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!imageUrl) {
      setError("Please generate a meme first");
      return;
    }

    if (!nftService.validateMinimumBalance(balance)) {
      const errorMsg =
        "Your SOL balance is insufficient. You need at least 0.05 SOL to pay for minting fees (including Mint account creation fees). Please get more Devnet SOL and try again.";
      console.error(errorMsg, { currentBalance: balance });
      setError(errorMsg);
      return;
    }

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
      const mintResult = await nftService.mintNft({
        wallet,
        imageUrl,
        prompt,
      });

      console.log("NFT minted successfully!");
      console.log("Mint address:", mintResult.mintAddress);
      console.log("Solscan link:", mintResult.solscanLink);

      setNftAddress(mintResult.mintAddress);
      setSolscanLink(mintResult.solscanLink);
      setNftMinted(true);
      localStorage.setItem("lastSolscanLink", mintResult.solscanLink);
    } catch (error) {
      console.error("Error minting NFT:", error);

      let errorMessage = "Error minting NFT 💥\n\n";

      if (error instanceof Error) {
        errorMessage += `Error details: ${error.message}\n\n`;

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
    <div className="min-h-screen text-white font-vt323 relative z-0">
      {/* 顶部标题 - 固定头部 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-6 px-4 md:py-8 bg-transparent">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <NeonTitle>STALKGEN-NFT</NeonTitle>
          </div>
        </div>
      </header>

      {/* 主要内容：垂直滚动布局 */}
      <main className="flex-grow container mx-auto px-4 pt-40 pb-12 relative z-10 space-y-16 border-0">
        {/* 介绍文字 */}
        <section className="text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl mb-6 neon-text"
            style={{
              textShadow:
                "0 0 10px #ffcc00, 0 0 20px #ffcc00, 0 0 30px #ffcc00",
              color: "#ffffff",
            }}
          >
            Create Your Unique Pixel Art NFT
          </h2>
          <p
            className="text-lg md:text-xl mb-4 neon-text"
            style={{
              textShadow: "0 0 8px #ffcc00, 0 0 16px #ffcc00",
              color: "#ffffff",
            }}
          >
            Create your unique pixel art NFT with AI power
          </p>
          <p
            className="text-xl md:text-2xl mb-8 neon-text"
            style={{
              textShadow: "0 0 10px #ffcc00, 0 0 20px #ffcc00",
              color: "#ffffff",
            }}
          >
            Generate stunning pixel art NFTs with AI, mint them on Solana, and
            join the cyberpunk digital art revolution.
          </p>
        </section>

        {/* 输入区域：Generate NFT 卡片 */}
        <section className="flex justify-center">
          <GenerateNFTPanel
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={generateMeme}
            loading={loading}
            error={error}
            walletPublicKey={
              isClient && wallet.publicKey ? wallet.publicKey.toBase58() : null
            }
            balance={balance}
            balanceLoading={balanceLoading}
            onMint={mintNFT}
            mintLoading={mintLoading}
            nftMinted={nftMinted}
            nftAddress={nftAddress}
            solscanLink={solscanLink}
            style={style}
            setStyle={setStyle}
          />
        </section>

        {/* NFT 预览区：下滑才能看到 */}
        <section className="flex justify-center mt-12">
          <NFTPreviewPanel imageUrl={imageUrl} style={style} />
        </section>
      </main>

      {/* 底部说明文字 */}
      <footer className="py-8 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <p
            className="text-xl md:text-2xl neon-text"
            style={{
              textShadow: "0 0 8px #ffcc00, 0 0 16px #ffcc00",
              color: "#ffffff",
            }}
          >
            StalkGen NFT - Create your unique AI-generated NFT
          </p>
          <p
            className="neon-text mt-2"
            style={{
              textShadow: "0 0 6px #ffcc00, 0 0 12px #ffcc00",
              color: "#ffffff",
            }}
          >
            Powered by AI + Pixel Art + Solana
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WalletProviderWrapper>
      <HomeContent />
    </WalletProviderWrapper>
  );
}

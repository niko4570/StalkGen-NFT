"use client";

import { useState } from "react";
import { Image, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import crypto from "crypto";

interface Metadata {
  imageUrl: string;
  prompt: string;
}

// 生成 Seedream API 签名
function generateSignature(
  method: string,
  endpoint: string,
  sk: string,
  body: any,
) {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);
  const bodyString = JSON.stringify(body);
  const signatureString = `${method}\n${endpoint}\n${timestamp}\n${nonce}\n${bodyString}\n`;

  const hmac = crypto.createHmac("sha256", sk);
  hmac.update(signatureString, "utf8");
  return hmac.digest("base64");
}

export default function Home() {
  const wallet = useWallet();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [error, setError] = useState("");
  const [nftMinted, setNftMinted] = useState(false);
  const [nftAddress, setNftAddress] = useState("");
  const [solscanLink, setSolscanLink] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      process.env.PUBLIC_SOLANA_RPC_URL ||
      "https://api.devnet.solana.com",
  );

  const generateMeme = async () => {
    if (!prompt) {
      setError("请输入提示词");
      return;
    }

    setLoading(true);
    setError("");
    setNftMinted(false);

    try {
      // 使用前端直接调用 Seedream API
      const ak =
        process.env.NEXT_PUBLIC_SEEDREAM_API_AK ||
        process.env.PUBLIC_SEEDREAM_API_AK;
      const sk =
        process.env.NEXT_PUBLIC_SEEDREAM_API_SK ||
        process.env.PUBLIC_SEEDREAM_API_SK;

      // Validate API keys with specific error messages
      if (!ak) {
        console.error(
          "Seedream API Access Key (AK) is missing. Please check your environment variables.",
        );
        console.error(
          "Expected variables: NEXT_PUBLIC_SEEDREAM_API_AK or PUBLIC_SEEDREAM_API_AK",
        );
        throw new Error(
          "缺少 Seedream API Access Key (AK)，请检查环境变量配置",
        );
      }

      if (!sk) {
        console.error(
          "Seedream API Secret Key (SK) is missing. Please check your environment variables.",
        );
        console.error(
          "Expected variables: NEXT_PUBLIC_SEEDREAM_API_SK or PUBLIC_SEEDREAM_API_SK",
        );
        throw new Error(
          "缺少 Seedream API Secret Key (SK)，请检查环境变量配置",
        );
      }

      console.log("Seedream API keys retrieved successfully");

      // 调用 Seedream API
      const body = {
        model: "seedream-universal-3.0",
        prompt,
        negative_prompt: "",
        n: 1,
        size: "1024x1024",
      };

      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(2, 15);
      const endpoint = "/api/v3/text2image";

      const response = await fetch(
        "https://seedream-api.bytedance.com/api/v3/text2image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-TOP-Request-Id": crypto.randomUUID(),
            "X-TOP-Timestamp": timestamp.toString(),
            "X-TOP-Nonce": nonce,
            "X-TOP-Account-Id": ak,
            "X-TOP-Signature": generateSignature("POST", endpoint, sk, body),
            "X-TOP-Signature-Method": "HMAC-SHA256",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Seedream API error: ${errorData.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Seedream API response:", data);

      // 提取图片 URL
      let imageUrl = null;
      if (data.data && data.data.length > 0) {
        imageUrl = data.data[0].url;
      } else if (data.images && data.images.length > 0) {
        imageUrl = data.images[0];
      } else {
        throw new Error("Unexpected output format from Seedream API");
      }

      if (!imageUrl) {
        throw new Error("Failed to get image URL from Seedream API");
      }

      console.log("Image generated successfully:", imageUrl);
      setImageUrl(imageUrl);
      setMetadata({ imageUrl, prompt });
    } catch (err) {
      console.error("Error generating meme:", err);

      // 提供更友好的错误信息和解决方案
      let errorMessage = "生成梗图时出错: ";
      if (err instanceof Error) {
        errorMessage += err.message;

        // 针对 API 密钥错误提供具体解决方案
        if (err.message.includes("Seedream API")) {
          errorMessage += "\n\n解决方案：\n";
          errorMessage +=
            "1. 检查 .env 文件中是否正确配置了 Seedream API 密钥\n";
          errorMessage += "2. 确保使用了正确的环境变量名称：\n";
          errorMessage += "   - NEXT_PUBLIC_SEEDREAM_API_AK (Access Key)\n";
          errorMessage += "   - NEXT_PUBLIC_SEEDREAM_API_SK (Secret Key)\n";
          errorMessage += "3. 重启开发服务器以加载最新的环境变量\n";
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

  const uploadMetadataToHelius = async (metadata: any) => {
    const response = await fetch("https://api.helius.xyz/v1/metadata/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.PUBLIC_HELIUS_API_KEY}`,
      },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload metadata to Helius");
    }

    return await response.json();
  };

  const mintNFT = async () => {
    if (!wallet.publicKey) {
      setError("请先连接钱包");
      return;
    }

    if (!imageUrl) {
      setError("请先生成梗图");
      return;
    }

    setMintLoading(true);
    setError("");

    try {
      // 创建 NFT metadata
      const timestamp = Math.floor(Date.now() / 1000);
      const shortPrompt =
        prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt;
      const nftMetadata = {
        name: `Meme: ${shortPrompt}`,
        description: `A meme generated from prompt: ${prompt}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Meme Type", value: "Generated" },
          { trait_type: "Timestamp", value: timestamp.toString() },
          { trait_type: "Prompt", value: prompt },
        ],
        external_url: "https://stalkgen.xyz",
        seller_fee_basis_points: 500,
        creators: [
          {
            address: wallet.publicKey.toBase58(),
            verified: true,
            share: 100,
          },
        ],
      };

      // 上传 metadata 到 Helius
      console.log("Uploading metadata to Helius...");
      const heliusResponse = await uploadMetadataToHelius(nftMetadata);
      const metadataUri = heliusResponse.metadata_uri;
      console.log("Metadata uploaded to:", metadataUri);

      // 初始化 Metaplex
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet),
      );

      // Mint NFT
      console.log("Minting NFT...");
      const { nft, response } = await metaplex.nfts().create({
        uri: metadataUri,
        name: `Meme: ${shortPrompt}`,
        symbol: "MEME",
        sellerFeeBasisPoints: 500,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
      });

      // 构建 Solscan 链接
      const mintAddress = nft.address.toBase58();
      const solscanLink = `https://solscan.io/token/${mintAddress}?cluster=devnet`;

      console.log("NFT minted successfully!");
      console.log("Mint address:", mintAddress);
      console.log("Solscan link:", solscanLink);

      // 更新状态
      setNftAddress(mintAddress);
      setSolscanLink(solscanLink);
      setNftMinted(true);
      localStorage.setItem("lastSolscanLink", solscanLink);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setError("Mint NFT 时出错 💥");
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎨 StalkGen NFT</h1>
          <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" />
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          AI 生成梗图并一键 Mint 为 NFT
        </p>

        {wallet.publicKey && (
          <div className="mt-4 text-center text-sm text-gray-500 mb-6">
            已连接钱包: {wallet.publicKey.toBase58().substring(0, 6)}...
            {wallet.publicKey.toBase58().substring(38)}
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

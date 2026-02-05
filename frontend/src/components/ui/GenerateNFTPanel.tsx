import { CyberpunkPanel } from "./CyberpunkPanel";
import { PixelButton } from "./PixelButton";

interface GenerateNFTPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string;
  walletPublicKey: string | null;
  balance: number;
  balanceLoading: boolean;
  onMint: () => void;
  mintLoading: boolean;
  nftMinted: boolean;
  nftAddress: string;
  solscanLink: string;
  style: string;
  setStyle: (style: string) => void;
  panelClassName?: string;
}

export function GenerateNFTPanel({
  prompt,
  setPrompt,
  onGenerate,
  loading,
  error,
  walletPublicKey,
  balance,
  balanceLoading,
  onMint,
  mintLoading,
  nftMinted,
  nftAddress,
  solscanLink,
  style,
  setStyle,
  panelClassName,
}: GenerateNFTPanelProps) {
  return (
    <CyberpunkPanel title="Generate NFT" className={panelClassName}>
      <div className="space-y-5">
        {/* Input Label */}
        <label className="block">
          <span
            className="font-vt323 text-xl text-[#ffdd44] mb-2 block"
            style={{
              textShadow: "0 0 4px #ffdd44, 1px 1px 0px rgba(0,0,0,0.5)",
              imageRendering: "pixelated",
            }}
          >
            Enter Prompt:
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your NFT prompt here..."
            rows={5}
            className="
              w-full px-4 py-3
              bg-[rgba(40,30,10,0.5)]
              border-2 border-[#ffcc66]
              text-[#ffddaa] placeholder:text-[#ffcc99]/60
              font-vt323 text-lg
              focus:outline-none focus:border-[#ffea00]
              focus:shadow-[0_0_12px_rgba(255,234,0,0.4)]
              transition-all duration-200
              resize-none
            "
            style={{
              imageRendering: "pixelated",
              textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
            }}
          />
        </label>

        {/* Style Selector */}
        <label className="block">
          <span
            className="font-vt323 text-xl text-[#ffdd44] mb-2 block"
            style={{
              textShadow: "0 0 4px #ffdd44, 1px 1px 0px rgba(0,0,0,0.5)",
              imageRendering: "pixelated",
            }}
          >
            NFT Style:
          </span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="
              w-full px-4 py-3
              bg-[rgba(40,30,10,0.5)]
              border-2 border-[#ffcc66]
              text-[#ffddaa]
              font-vt323 text-lg
              focus:outline-none focus:border-[#ffea00]
              focus:shadow-[0_0_12px_rgba(255,234,0,0.4)]
              transition-all duration-200
              cursor-pointer
            "
            style={{
              imageRendering: "pixelated",
            }}
          >
            <option value="cyberpunk">Cyberpunk Pixel Art</option>
            <option value="neon">Neon Vaporwave</option>
            <option value="retro">Retro 8-bit</option>
            <option value="torii">Torii Gate Night</option>
          </select>
        </label>

        {/* Description */}
        <p
          className="font-vt323 text-sm text-[#ffcc99]/80 leading-relaxed"
          style={{
            textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
          }}
        >
          Describe your ideal NFT pixel art
        </p>

        {/* Wallet Connection Info */}
        {walletPublicKey && typeof walletPublicKey === "string" && (
          <div className="p-4 bg-[rgba(40,30,10,0.5)] border-2 border-[#ffcc66]">
            <div className="mb-3">
              <span className="font-vt323 text-lg text-[#ffcc99]">
                Connected Wallet:{" "}
              </span>
              <span className="font-vt323 text-lg text-[#ffddaa]">
                {walletPublicKey.substring(0, 6)}...
                {walletPublicKey.substring(38)}
              </span>
            </div>
            <div>
              <span className="font-vt323 text-lg text-[#ffcc99]">
                Balance:{" "}
              </span>
              {balanceLoading ? (
                <span className="font-vt323 text-lg text-[#ffddaa]">
                  Checking balance...
                </span>
              ) : (
                <span className="font-vt323 text-lg text-[#ffddaa]">
                  {balance.toFixed(6)} SOL
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[rgba(40,30,10,0.5)] border-2 border-[#ff6666]">
            <div className="font-vt323 text-lg text-[#ff6666] whitespace-pre-line">
              {error}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <PixelButton
            onClick={onGenerate}
            disabled={
              loading || !walletPublicKey || typeof walletPublicKey !== "string"
            }
          >
            {loading ? "GENERATING..." : "Generate"}
          </PixelButton>
        </div>

        {/* Mint Button */}
        <div className="flex justify-center">
          <PixelButton
            onClick={onMint}
            isWalletConnectButton={
              !walletPublicKey || typeof walletPublicKey !== "string"
            }
            disabled={mintLoading}
          >
            {mintLoading
              ? "MINTING..."
              : !walletPublicKey || typeof walletPublicKey !== "string"
                ? "CONNECT WALLET"
                : "MINT AS NFT"}
          </PixelButton>
        </div>

        {/* Mint Success Message */}
        {nftMinted && nftAddress && (
          <div className="p-4 bg-[rgba(40,30,10,0.5)] border-2 border-[#ffcc66]">
            <h3 className="font-vt323 text-2xl text-[#ffea00] mb-3">
              NFT MINTED SUCCESSFULLY!
            </h3>
            <p className="font-vt323 text-lg text-[#ffddaa] mb-3">
              Mint Address: {nftAddress}
            </p>
            <p className="font-vt323 text-lg">
              <a
                href={
                  solscanLink ||
                  (nftAddress
                    ? `https://solscan.io/token/${nftAddress}?cluster=devnet`
                    : "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffea00] underline hover:text-[#ffff99]"
              >
                View on Solscan
              </a>
            </p>
          </div>
        )}
      </div>
    </CyberpunkPanel>
  );
}

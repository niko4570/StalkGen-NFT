import { CyberpunkPanel } from "./CyberpunkPanel";
import { PixelButton } from "./PixelButton";
import { useWallet } from "@solana/wallet-adapter-react";

interface NFTPreviewPanelProps {
  imageUrl: string;
  style: string;
}

export function NFTPreviewPanel({ imageUrl, style }: NFTPreviewPanelProps) {
  const wallet = useWallet();
  return (
    <CyberpunkPanel title="NFT Preview">
      <div className="space-y-5">
        {/* NFT Image Container */}
        <div
          className="
            relative w-full aspect-square
            bg-[rgba(40,30,10,0.5)]
            border-2 border-[#ffcc66]
            overflow-hidden
            group
          "
          style={{
            imageRendering: "pixelated",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated NFT"
              className="
                w-full h-full object-contain
                transition-all duration-300
                group-hover:scale-105
              "
              style={{
                imageRendering: "pixelated",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p
                className="font-vt323 text-2xl text-[#ffcc99] text-center px-4"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                Enter a prompt and generate your NFT
              </p>
            </div>
          )}

          {/* Hover overlay */}
          {imageUrl && (
            <div
              className="
                absolute inset-0
                bg-gradient-to-t from-[rgba(26,13,46,0.8)] to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                flex items-end justify-center pb-4
              "
            >
              <span
                className="font-vt323 text-2xl text-[#ffea00]"
                style={{
                  textShadow: "0 0 8px #ffea00, 2px 2px 0px rgba(0,0,0,0.8)",
                }}
              >
                PIXEL NFT #0001
              </span>
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div
          className="
            px-4 py-3
            bg-[rgba(40,30,10,0.5)]
            border-2 border-[#ffcc66]
          "
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span
                className="font-vt323 text-lg text-[#ffcc99]"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                Status:
              </span>
              <span
                className="font-vt323 text-lg text-[#ffea00]"
                style={{ textShadow: "0 0 6px #ffea00" }}
              >
                READY
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="font-vt323 text-lg text-[#ffcc99]"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                Style:
              </span>
              <span
                className="font-vt323 text-lg text-[#ffddaa]"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                {style === "cyberpunk"
                  ? "Cyberpunk Pixel Art"
                  : style === "neon"
                    ? "Neon Vaporwave"
                    : style === "retro"
                      ? "Retro 8-bit"
                      : style === "torii"
                        ? "Torii Gate Night"
                        : "Cyberpunk Pixel Art"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="font-vt323 text-lg text-[#ffcc99]"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                Resolution:
              </span>
              <span
                className="font-vt323 text-lg text-[#ffddaa]"
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
              >
                512x512
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <PixelButton>Download</PixelButton>
          </div>
          <div className="flex justify-center">
            <PixelButton isWalletConnectButton={!wallet.publicKey}>
              {!wallet.publicKey ? "CONNECT WALLET" : "MINT NFT"}
            </PixelButton>
          </div>
        </div>
      </div>
    </CyberpunkPanel>
  );
}

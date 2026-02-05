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

const STYLE_OPTIONS = [
  { value: "cyberpunk", label: "Cyberpunk Pixel Art" },
  { value: "neon", label: "Neon Vaporwave" },
  { value: "retro", label: "Retro 8-bit" },
  { value: "torii", label: "Torii Gate Night" },
];

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
      <div className="space-y-4 sm:space-y-5">
        {/* Input Label */}
        <label className="block space-y-2">
          <span className="font-heading text-sm uppercase tracking-[0.35em] text-[#ffd166] neon-text-amber">
            Enter Prompt
          </span>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Eg. Neon oni hacker rallying cyber wolves under glitchy rain"
              rows={4}
              className="w-full rounded-2xl border border-[#ffd166]/30 bg-[#050001]/80 px-4 py-3 font-body text-base text-[#f7e6cf]/90 placeholder:text-[#b0906b]/40 shadow-[0_0_35px_rgba(60,0,10,0.45)] transition focus:border-[#ffd166] focus:ring-2 focus:ring-[#ffd166]/40 sm:px-5 sm:py-4"
            />
            <span className="pointer-events-none absolute inset-y-3 right-4 text-xs uppercase tracking-[0.4em] text-[#b0906b]/60 sm:inset-y-4">
              1024px
            </span>
          </div>
        </label>

        {/* Style Selector */}
        <fieldset className="space-y-3">
          <legend className="font-heading text-sm uppercase tracking-[0.35em] text-[#ffd166] neon-text-amber">
            NFT Style
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {STYLE_OPTIONS.map((option) => {
              const isSelected = style === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStyle(option.value)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-[#ffd166]/80 bg-[#ffd1661a] shadow-[0_0_25px_rgba(255,209,102,0.35)]"
                    : "border-[#ffd166]/20 bg-[#050001]/60 hover:border-[#ffd166]/60"
                }`}
                >
                  <span className="font-heading text-sm uppercase tracking-[0.3em] text-[#f7e6cf]">
                    {option.label}
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isSelected ? "bg-[#ffd166]" : "bg-[#b0906b]/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Description */}
        <div className="rounded-2xl border border-[#ffd166]/25 bg-[#050001]/70 p-3 text-sm leading-relaxed text-[#d7b88b]/85 sm:p-4 font-body">
          Describe the neon environment, characters, motion, and any lore hooks.
        </div>

        {/* Wallet Connection Info */}
        <div className="rounded-2xl border border-[#ffd166]/30 bg-[#0a0004]/70 p-4 shadow-[0_0_30px_rgba(60,20,0,0.4)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm uppercase tracking-[0.4em] text-[#ffd166] neon-text-amber">
              Wallet Channel
            </span>
            <span className="font-heading text-base tracking-[0.3em] text-[#f7e6cf]/85">
              {walletPublicKey && typeof walletPublicKey === "string"
                ? `${walletPublicKey.slice(0, 6)}…${walletPublicKey.slice(-4)}`
                : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.4em] text-[#ffd166] neon-text-amber">
            <span>Balance</span>
            <span className="font-heading text-2xl tracking-[0.3em] text-[#ffd166] neon-text-amber">
              {balanceLoading
                ? "SYNC…"
                : `${balance.toFixed(3)} ${walletPublicKey ? "SOL" : ""}`}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-500/60 bg-red-500/10 p-4 font-body text-sm text-red-200 whitespace-pre-line">
            {error}
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
            {loading ? "GENERATING…" : "Generate"}
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
              ? "MINTING…"
              : !walletPublicKey || typeof walletPublicKey !== "string"
                ? "CONNECT WALLET"
                : "MINT AS NFT"}
          </PixelButton>
        </div>

        {nftMinted && nftAddress && (
          <div className="rounded-2xl border border-[#ffd166]/60 bg-[#120205]/80 p-5 shadow-[0_0_30px_rgba(255,209,102,0.25)]">
            <h3 className="font-heading text-2xl uppercase tracking-[0.3em] text-[#ffd166]">
              NFT Minted
            </h3>
            <p className="mt-2 font-body text-[#d7b88b]/85">
              Mint Address: {nftAddress}
            </p>
            <p className="mt-3 font-body text-sm">
              <a
                href={
                  solscanLink ||
                  (nftAddress
                    ? `https://solscan.io/token/${nftAddress}?cluster=devnet`
                    : "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffd166] underline decoration-dotted hover:text-[#f7e6cf]"
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

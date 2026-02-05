import Image from "next/image";
import { CyberpunkPanel } from "./CyberpunkPanel";

interface NFTPreviewPanelProps {
  imageUrl: string;
  style: string;
  panelClassName?: string;
}

const STYLE_LABELS: Record<string, string> = {
  cyberpunk: "Cyberpunk Pixel Art",
  neon: "Neon Vaporwave",
  retro: "Retro 8-bit",
  torii: "Torii Gate Night",
};

const PLACEHOLDER_GRID = Array.from({ length: 16 });

export function NFTPreviewPanel({
  imageUrl,
  style,
  panelClassName,
}: NFTPreviewPanelProps) {
  const readableStyle =
    STYLE_LABELS[style as keyof typeof STYLE_LABELS] ?? STYLE_LABELS.cyberpunk;

  return (
    <CyberpunkPanel title="NFT Preview" className={panelClassName}>
      <div className="space-y-5">
        <div className="group relative w-full overflow-hidden rounded-[24px] border border-[#ffcc66]/60 bg-[rgba(12,5,25,0.8)] p-4 transition hover:border-[#ffea00] sm:p-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-[#ffcc66]/30 bg-black/40">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Generated NFT"
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-contain transition duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 text-center">
                <div className="grid grid-cols-4 gap-2">
                  {PLACEHOLDER_GRID.map((_, index) => (
                    <span
                      key={index}
                      className="h-4 w-4 rounded-[4px] bg-gradient-to-br from-[#ff00cc33] to-[#00f0ff22]"
                    />
                  ))}
                </div>
                <p className="px-4 text-xl text-[#ffcc99]/80">
                  Enter a prompt to render your first cyberpunk meme.
                </p>
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-16 text-center text-2xl uppercase tracking-[0.4em] text-[#ffea00] transition duration-300 group-hover:translate-y-0">
              Preview Locked In
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-[18px] border border-[#ffcc66]/40 bg-black/40 p-5 text-sm uppercase tracking-[0.3em] text-white/60 sm:grid-cols-2">
          <div>
            <p className="text-xs text-white/40">Status</p>
            <p className="mt-2 text-2xl text-white">
              {imageUrl ? "Ready" : "Awaiting Prompt"}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Style</p>
            <p className="mt-2 text-2xl text-white">{readableStyle}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Resolution</p>
            <p className="mt-2 text-2xl text-white">1024 x 1024</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Checksum</p>
            <p className="mt-2 text-2xl text-[#ffea00]">
              {imageUrl ? "MATCHED" : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </CyberpunkPanel>
  );
}

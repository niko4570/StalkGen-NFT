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
      <div className="space-y-6">
        <div className="group relative w-full overflow-hidden rounded-3xl border border-[#ff2e49]/30 bg-[#120205]/40 p-4 shadow-[0_0_40px_rgba(60,0,10,0.45)] transition duration-300 hover:border-[#ffd166]/40 sm:p-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#ffd166]/20 bg-gradient-to-br from-[#050005] to-[#15030a]">
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
                      className="h-4 w-4 rounded-[6px] bg-gradient-to-br from-[#f43f5e]/40 to-[#22d3ee]/40 backdrop-blur"
                    />
                  ))}
                </div>
                <p className="px-4 font-heading text-lg uppercase tracking-[0.4em] text-[#b0906b]/80">
                  Feed the prompt to light up the frame.
                </p>
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-[#050003] via-[#050003]/90 to-transparent px-6 pb-6 pt-12 text-center font-heading text-xl uppercase tracking-[0.4em] text-[#ffd166] transition duration-300 group-hover:translate-y-0">
              Preview Locked In
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#ffd166]/20 bg-[#0a0004]/60 p-5 text-sm uppercase tracking-[0.3em] text-[#d7b88b]/85 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#b0906b]/75 neon-text-yellow">Status</p>
            <p className="mt-2 font-heading text-2xl text-[#f7e6cf] neon-text-amber">
              {imageUrl ? "Ready" : "Awaiting Prompt"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b0906b]/75 neon-text-yellow">Style</p>
            <p className="mt-2 font-heading text-2xl text-[#f7e6cf] neon-text-amber">
              {readableStyle}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b0906b]/75 neon-text-yellow">Resolution</p>
            <p className="mt-2 font-heading text-2xl text-[#f7e6cf] neon-text-amber">
              1024 x 1024
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b0906b]/75 neon-text-yellow">Checksum</p>
            <p className="mt-2 font-heading text-2xl text-[#ffd166] neon-text-amber">
              {imageUrl ? "MATCHED" : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </CyberpunkPanel>
  );
}

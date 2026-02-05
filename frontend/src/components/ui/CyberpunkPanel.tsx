import { ReactNode } from "react";

interface CyberpunkPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function CyberpunkPanel({
  title,
  children,
  className = "",
}: CyberpunkPanelProps) {
  return (
    <div
      className={`
        cyberpunk-panel
        relative w-full
        bg-gradient-to-br from-[rgba(26,13,46,0.45)] via-[rgba(30,15,60,0.5)] to-[rgba(42,26,74,0.5)]
        backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:scale-[1.03]
        ${className}
      `}
      style={{
        border: "5px solid #ffcc00",
        boxShadow: `
          inset 0 0 12px #ffcc00,
          0 0 16px #ffaa00,
          0 0 32px rgba(255,255,153,0.6)
        `,
        imageRendering: "pixelated",
      }}
    >
      {/* Animated border glow effect */}
      <div
        className="absolute inset-0 pointer-events-none animate-pulse"
        style={{
          boxShadow: `
            inset 0 0 20px rgba(255,204,0,0.3),
            0 0 24px rgba(255,170,0,0.4),
            0 0 40px rgba(255,255,153,0.3)
          `,
        }}
      />

      {/* Title Section */}
      <div className="relative px-6 py-4 border-b-2 border-[#ffcc00]/40">
        <h2
          className="font-vt323 text-3xl tracking-wider uppercase text-[#ffea00]"
          style={{
            textShadow: `
              0 0 8px #ffdd44,
              0 0 16px rgba(255,255,153,0.6),
              2px 2px 0px rgba(0,0,0,0.5)
            `,
            imageRendering: "pixelated",
          }}
        >
          {title}
        </h2>
        {/* Corner decorations */}
        <div
          className="absolute top-2 right-2 w-3 h-3 bg-[#ffcc00]"
          style={{
            boxShadow: "0 0 8px #ffcc00",
            imageRendering: "pixelated",
          }}
        />
        <div
          className="absolute bottom-2 left-2 w-3 h-3 bg-[#ffcc00]"
          style={{
            boxShadow: "0 0 8px #ffcc00",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Content Section */}
      <div className="relative p-6">{children}</div>

      {/* Bottom corner accents */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        <div
          className="w-2 h-2 bg-[#ffaa00] animate-pulse"
          style={{
            boxShadow: "0 0 6px #ffaa00",
            imageRendering: "pixelated",
          }}
        />
        <div
          className="w-2 h-2 bg-[#ffaa00] animate-pulse"
          style={{
            boxShadow: "0 0 6px #ffaa00",
            imageRendering: "pixelated",
            animationDelay: "0.3s",
          }}
        />
        <div
          className="w-2 h-2 bg-[#ffaa00] animate-pulse"
          style={{
            boxShadow: "0 0 6px #ffaa00",
            imageRendering: "pixelated",
            animationDelay: "0.6s",
          }}
        />
      </div>
    </div>
  );
}

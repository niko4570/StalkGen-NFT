import { ButtonHTMLAttributes } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isWalletConnectButton?: boolean;
}

export function PixelButton({
  children = "GENERATE NFT",
  onClick,
  disabled,
  className = "",
  isWalletConnectButton = false,
  ...props
}: PixelButtonProps) {
  const { setVisible } = useWalletModal();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isWalletConnectButton) {
      setVisible(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        pixel-button
        relative
        flex items-center justify-start gap-4
        px-6 py-4
        transition-all duration-200
        group
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.03] cursor-pointer"}
        ${className}
      `}
      style={{
        width: "280px",
        height: "72px",
        backgroundColor: "rgba(26, 13, 46, 0.7)",
        border: "5px solid #ffcc00",
        boxShadow: `
          inset 0 0 12px rgba(255, 204, 0, 0.3),
          0 0 16px rgba(255, 170, 0, 0.5),
          0 0 32px rgba(255, 255, 153, 0.3)
        `,
        imageRendering: "pixelated",
      }}
      {...props}
    >
      {/* Hover glow effect */}
      {!disabled && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `
              inset 0 0 20px rgba(255, 234, 0, 0.5),
              0 0 24px rgba(255, 170, 0, 0.8),
              0 0 40px rgba(255, 255, 153, 0.6)
            `,
          }}
        />
      )}

      {/* Corner decorations */}
      <div
        className="absolute top-1 left-1 w-2 h-2 bg-[#ffcc00]"
        style={{
          boxShadow: "0 0 6px #ffcc00",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute top-1 right-1 w-2 h-2 bg-[#ffcc00]"
        style={{
          boxShadow: "0 0 6px #ffcc00",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute bottom-1 left-1 w-2 h-2 bg-[#ffcc00]"
        style={{
          boxShadow: "0 0 6px #ffcc00",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute bottom-1 right-1 w-2 h-2 bg-[#ffcc00]"
        style={{
          boxShadow: "0 0 6px #ffcc00",
          imageRendering: "pixelated",
        }}
      />

      {/* Animated border accent */}
      {!disabled && (
        <div
          className="absolute inset-0 animate-pulse pointer-events-none"
          style={{
            border: "1px solid rgba(255, 234, 0, 0.5)",
            margin: "2px",
          }}
        />
      )}

      {/* Lantern Icon with Arrow */}
      <div
        className="relative flex-shrink-0 z-10 transition-transform duration-200 group-hover:translate-x-1"
        style={{ width: "32px", height: "32px" }}
      >
        {/* Glow effect behind icon */}
        {!disabled && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(255,234,0,0.4) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        )}

        {/* Main Pixel Art */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="w-full h-full relative z-10"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Lantern Top */}
          <rect x="12" y="6" width="8" height="2" fill="#ffcc00" />
          <rect x="10" y="8" width="12" height="2" fill="#ffaa00" />

          {/* Lantern Body - Outer */}
          <rect x="10" y="10" width="2" height="2" fill="#ffaa00" />
          <rect x="20" y="10" width="2" height="2" fill="#ffaa00" />
          <rect x="9" y="12" width="2" height="8" fill="#ffaa00" />
          <rect x="21" y="12" width="2" height="8" fill="#ffaa00" />
          <rect x="10" y="20" width="2" height="2" fill="#ffaa00" />
          <rect x="20" y="20" width="2" height="2" fill="#ffaa00" />

          {/* Lantern Body - Inner */}
          <rect x="11" y="10" width="10" height="2" fill="#ffff99" />
          <rect x="11" y="12" width="10" height="8" fill="#ffcc00" />
          <rect x="11" y="20" width="10" height="2" fill="#ffff99" />

          {/* Lantern Core - Glowing center */}
          <rect
            x="13"
            y="14"
            width="6"
            height="4"
            fill="#ffff99"
            className="group-hover:opacity-100 opacity-80 transition-opacity"
          />

          {/* Lantern Bottom */}
          <rect x="12" y="22" width="8" height="2" fill="#ffaa00" />
          <rect x="14" y="24" width="4" height="2" fill="#ffcc00" />

          {/* Arrow - Pointing Right */}
          <rect x="18" y="15" width="2" height="2" fill="#ffff99" />
          <rect x="20" y="15" width="2" height="2" fill="#ffff99" />
          <rect x="22" y="14" width="2" height="1" fill="#ffff99" />
          <rect x="22" y="17" width="2" height="1" fill="#ffff99" />
          <rect
            x="24"
            y="15"
            width="2"
            height="2"
            fill="#ffff99"
            className="group-hover:opacity-100 opacity-70 transition-opacity"
          />
        </svg>
      </div>

      {/* Text */}
      <span
        className="relative z-10 flex-1 text-left transition-all duration-200 group-hover:translate-x-1"
        style={{
          fontFamily: "'VT323', 'Courier New', monospace",
          color: disabled ? "#997744" : "#ffea00",
          fontSize: "22px",
          letterSpacing: "0.1em",
          imageRendering: "pixelated",
          textShadow: disabled
            ? "none"
            : "0 0 8px rgba(255, 234, 0, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.5)",
        }}
      >
        {children}
      </span>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,204,0,0.1) 2px, rgba(255,204,0,0.1) 4px)",
        }}
      />
    </button>
  );
}

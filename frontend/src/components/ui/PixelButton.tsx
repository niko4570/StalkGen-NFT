import { ButtonHTMLAttributes, MouseEvent } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (isWalletConnectButton) {
      setVisible(true);
      return;
    }

    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        pixel-button
        relative inline-flex items-center justify-between gap-4
        min-w-[260px] overflow-hidden rounded-2xl border border-[#ff2e49]/40
        px-6 py-4 font-heading uppercase tracking-[0.18em]
        transition duration-300
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
        ${className}
      `}
      {...props}
    >
      {/* Outer glow */}
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#5b0008] via-[#ff2e49] to-[#ffd166] opacity-80 blur-3xl" />

      {/* Inner panel */}
      <span className="absolute inset-[2px] rounded-[22px] bg-[#070003]/95 ring-1 ring-white/5" />

      {/* Animated scanline */}
      <span className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen">
        <span className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#ffd166]/50 to-transparent animate-[scan_2.5s_linear_infinite]" />
      </span>

      <span className="relative z-10 flex flex-col text-left text-[#ffe7b7]">
        <span className="text-[0.6rem] tracking-[0.45em] text-[#b0906b]/80">
          {isWalletConnectButton ? "Wallet Sync" : "Command"}
        </span>
        <span className="text-2xl tracking-[0.2em]">{children}</span>
      </span>

      <span className="relative z-10 text-right text-[0.7rem] tracking-[0.35em] text-[#d7b88b]/85">
        <span className="block text-[0.6rem]">Status</span>
        <span className="text-[#ffd166]">{disabled ? "Standby" : "Ready"}</span>
      </span>
    </button>
  );
}

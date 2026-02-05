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
    <section
      className={`
        cyberpunk-panel
        relative w-full overflow-hidden rounded-3xl border border-[#ff2e49]/30
        bg-gradient-to-br from-[#3b060d]/35 via-[#22030a]/40 to-[#12020a]/50
        p-[1px]
        transition duration-300 hover:border-[#ffd166]/60 hover:shadow-[0_0_40px_rgba(255,209,102,0.5)]
        ${className}
      `}
    >
      <div className="relative h-full rounded-[calc(1.5rem-2px)] bg-[rgba(10,0,6,0.35)] backdrop-blur-xl px-6 py-6">
        {/* HUD grid */}
        <span className="pointer-events-none absolute inset-0 opacity-10">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,46,73,0.16),transparent_55%)]" />
          <span className="absolute inset-0 bg-[linear-gradient(rgba(255,209,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,46,73,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </span>

        {/* Title */}
        <header className="relative mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.35em] text-[#ffd6a3]/70 neon-text-yellow">
              Module
            </p>
            <h2 className="font-heading text-3xl uppercase tracking-[0.25em] text-[#fff3d6] neon-text-amber">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-[#ffd6a3]/70">
            <span className="h-2 w-2 rounded-full bg-[#ffd166] shadow-[0_0_12px_#ffd166]" />
            Active
          </div>
        </header>

        <div className="relative">{children}</div>

        {/* Corner brackets */}
        <span className="pointer-events-none absolute inset-0 opacity-60">
          <span className="absolute left-4 top-4 h-6 w-6 border-l border-t border-white/20" />
          <span className="absolute right-4 top-4 h-6 w-6 border-r border-t border-white/20" />
          <span className="absolute left-4 bottom-4 h-6 w-6 border-b border-l border-white/20" />
          <span className="absolute right-4 bottom-4 h-6 w-6 border-b border-r border-white/20" />
        </span>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletProviderWrapper } from "./providers";
import { memeService } from "../services/memeService";
import { nftService } from "../services/nftService";
import { GenerateNFTPanel } from "../components/ui/GenerateNFTPanel";
import { NFTPreviewPanel } from "../components/ui/NFTPreviewPanel";
import { PixelButton } from "../components/ui/PixelButton";

const HERO_BADGES = [
  "Jimeng 4.0 Engine",
  "Metaplex + Irys",
  "Solana Devnet Ready",
];

const STYLE_LABELS: Record<string, string> = {
  cyberpunk: "Cyberpunk Pixel Art",
  neon: "Neon Vaporwave",
  retro: "Retro 8-bit",
  torii: "Torii Gate Night",
};

const TIMELINE_STEPS = [
  {
    title: "Prompt",
    caption: "Describe the neon dream",
    description:
      "Craft an evocative cyberpunk story, then let Volcengine Jimeng interpret every pixel-perfect beat.",
    accent:
      "linear-gradient(120deg, rgba(255,46,73,0.45), rgba(255,209,102,0.2))",
    emoji: "⌨️",
  },
  {
    title: "Synthesize",
    caption: "AI renders pixels",
    description:
      "We fan out async jobs to Jimeng 4.0, poll for completions, and normalize the asset for the preview frame.",
    accent:
      "linear-gradient(120deg, rgba(255,120,0,0.35), rgba(255,46,73,0.2))",
    emoji: "⚙️",
  },
  {
    title: "Verify",
    caption: "Wallet + balance check",
    description:
      "Your Phantom/Solflare wallet stays in sync—SOL balance + permissions are validated before minting.",
    accent:
      "linear-gradient(120deg, rgba(255,209,102,0.4), rgba(255,156,0,0.2))",
    emoji: "🔐",
  },
  {
    title: "Mint",
    caption: "On-chain forever",
    description:
      "Metadata uploads via Irys, then Umi signs the mint tx so your pixel meme lives on Solana forever.",
    accent:
      "linear-gradient(120deg, rgba(255,46,73,0.35), rgba(255,238,179,0.25))",
    emoji: "🚀",
  },
];

// Reusable component: Neon Title
const NeonTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative inline-block"
    style={{ letterSpacing: "0.18em" }}
    aria-label={String(children)}
  >
    <h1
      className="glitch neon-text-amber neon-text-pulse font-heading text-6xl md:text-7xl lg:text-8xl uppercase tracking-[0.08em] text-[#ffeeb3]"
      data-text={String(children)}
    >
      {children}
    </h1>
    <div className="absolute inset-0 pointer-events-none mix-blend-screen">
      <div className="h-full w-full animate-[glitchShift_2.5s_infinite] border-b-4 border-[#ff2e49]/70" />
    </div>
  </div>
);

function HomeContent() {
  const wallet = useWallet();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [error, setError] = useState("");
  const [nftMinted, setNftMinted] = useState(false);
  const [nftAddress, setNftAddress] = useState("");
  const [solscanLink, setSolscanLink] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [style, setStyle] = useState("cyberpunk");
  const [isClient, setIsClient] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState(0);
  const generatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const timer = window.setInterval(() => {
      setActiveTimelineStep((prev) => (prev + 1) % TIMELINE_STEPS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isClient]);

  const checkBalance = useCallback(async () => {
    if (!isClient || !wallet.publicKey) return;

    setBalanceLoading(true);
    try {
      const solBalance = await nftService.checkBalance(wallet.publicKey);
      setBalance(solBalance);
    } catch (err) {
      console.error("Error checking balance:", err);
      setError(
        "Failed to check balance, please ensure network connection is normal",
      );
    } finally {
      setBalanceLoading(false);
    }
  }, [isClient, wallet.publicKey]);

  useEffect(() => {
    if (isClient && wallet.connected && wallet.publicKey) {
      checkBalance();
    } else {
      setBalance(0);
    }
  }, [checkBalance, isClient, wallet.connected, wallet.publicKey]);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const generateMeme = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setNftMinted(false);

    try {
      const result = await memeService.generateMeme({
        prompt,
        negative_prompt: "",
        size: "1024x1024",
      });

      console.log("Image generated successfully:", result.imageUrl);
      setImageUrl(result.imageUrl);
    } catch (err) {
      console.error("Error generating meme:", err);

      let errorMessage = "Error generating meme: ";
      if (err instanceof Error) {
        errorMessage += err.message;

        if (
          err.message.includes("502") ||
          err.message.includes("Bad Gateway")
        ) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage +=
            "1. Please try again later, Volcengine API is temporarily unavailable\n";
          errorMessage += "2. Check if network connection is normal\n";
          errorMessage += "3. Try using a simpler prompt\n";
        } else if (err.message.includes("API keys")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage +=
            "1. Please contact administrator to configure API keys\n";
          errorMessage +=
            "2. Ensure backend server has correctly set environment variables\n";
        } else if (err.message.includes("timeout")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage += "1. Please use a shorter prompt\n";
          errorMessage += "2. Check if network connection is stable\n";
          errorMessage += "3. Try again later\n";
        } else if (err.message.includes("API error")) {
          errorMessage += "\n\nSolutions:\n";
          errorMessage += "1. Ensure backend server is running\n";
          errorMessage +=
            "2. Check if Seedream API keys are correctly configured in .env file\n";
          errorMessage +=
            "3. Ensure environment variable names in backend are correct\n";
          errorMessage +=
            "4. Restart backend server to load latest environment variables\n";
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

  const mintNFT = async () => {
    if (!isClient) {
      setError("Please connect your wallet first");
      return;
    }

    if (!wallet.publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!imageUrl) {
      setError("Please generate a meme first");
      return;
    }

    if (!nftService.validateMinimumBalance(balance)) {
      const errorMsg =
        "Your SOL balance is insufficient. You need at least 0.05 SOL to pay for minting fees (including Mint account creation fees). Please get more Devnet SOL and try again.";
      console.error(errorMsg, { currentBalance: balance });
      setError(errorMsg);
      return;
    }

    if (!wallet.signTransaction) {
      const errorMsg =
        "Wallet does not have sufficient permissions to sign transactions. Please ensure wallet is fully connected.";
      console.error(errorMsg, { wallet: wallet.publicKey?.toBase58() });
      setError(errorMsg);
      return;
    }

    setMintLoading(true);
    setError("");

    try {
      const mintResult = await nftService.mintNft({
        wallet,
        imageUrl,
        prompt,
      });

      console.log("NFT minted successfully!");
      console.log("Mint address:", mintResult.mintAddress);
      console.log("Solscan link:", mintResult.solscanLink);

      setNftAddress(mintResult.mintAddress);
      setSolscanLink(mintResult.solscanLink);
      setNftMinted(true);
      localStorage.setItem("lastSolscanLink", mintResult.solscanLink);
    } catch (error) {
      console.error("Error minting NFT:", error);

      let errorMessage = "Error minting NFT 💥\n\n";

      if (error instanceof Error) {
        errorMessage += `Error details: ${error.message}\n\n`;

        if (error.message.includes("User rejected the request")) {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Please ensure you have authorized wallet to sign transaction\n";
          errorMessage +=
            "2. Please check wallet popup and ensure you have clicked confirm button\n";
          errorMessage +=
            "3. If you accidentally rejected the request, please try minting again\n";
        } else if (error.message.includes("AccountNotFoundError")) {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Ensure you are using the correct network (Solana Devnet)\n";
          errorMessage +=
            "2. Ensure wallet has sufficient Devnet SOL (at least 0.05 SOL)\n";
          errorMessage +=
            "3. Please try refreshing the page, reconnecting wallet, then try minting again\n";
          errorMessage +=
            "4. Please ensure your wallet is fully synchronized to Devnet network\n";
          errorMessage +=
            "5. Try using another Devnet RPC endpoint, current RPC may be unstable\n";
          errorMessage +=
            "6. Try again later, transaction may not be confirmed due to network congestion\n";
        } else if (error.message.includes("Failed to upload metadata")) {
          errorMessage += "Solutions:\n";
          errorMessage += "1. Check if metadata format is correct\n";
          errorMessage +=
            "2. Ensure image URL is accessible and format is correct\n";
          errorMessage +=
            "3. Try again later, may be network connection issue\n";
        } else {
          errorMessage += "Solutions:\n";
          errorMessage +=
            "1. Ensure wallet is connected and has sufficient SOL for gas fees\n";
          errorMessage += "2. Check if network connection is normal\n";
          errorMessage +=
            "3. Ensure you have authorized wallet to sign transaction\n";
          errorMessage +=
            "4. Try again later, may be network congestion or service temporarily unavailable\n";
        }
      } else {
        errorMessage += `Unknown error: ${String(error)}\n\n`;
        errorMessage += "Solutions:\n";
        errorMessage +=
          "1. Ensure wallet is connected and has sufficient SOL for gas fees\n";
        errorMessage += "2. Check if network connection is normal\n";
        errorMessage +=
          "3. Ensure you have authorized wallet to sign transaction\n";
        errorMessage +=
          "4. Try again later, may be network congestion or service temporarily unavailable\n";
      }

      setError(errorMessage);
    } finally {
      setMintLoading(false);
    }
  };

  const readableStyle =
    STYLE_LABELS[style as keyof typeof STYLE_LABELS] ??
    STYLE_LABELS.cyberpunk;

  const mintedExplorerUrl =
    solscanLink ||
    (nftAddress
      ? `https://solscan.io/token/${nftAddress}?cluster=devnet`
      : "");

  const heroStats = [
    {
      label: "Mint Window",
      value: nftMinted ? "FORGED" : mintLoading ? "MINTING" : "STANDING BY",
      helper: nftMinted
        ? "Share the Solscan proof"
        : mintLoading
          ? "Signing + uploading metadata"
          : "Generate art before minting",
      href: nftMinted ? mintedExplorerUrl : undefined,
    },
    {
      label: "Wallet Sync",
      value: wallet.publicKey
        ? `${balance.toFixed(3)} SOL`
        : "Wallet Offline",
      helper: wallet.publicKey
        ? "Devnet wallet connected"
        : "Connect Phantom or Solflare",
    },
    {
      label: "Selected Style",
      value: readableStyle,
      helper: "Switch styles inside the generator",
    },
    {
      label: "Avg. Latency",
      value: "≈25s",
      helper: "Volcengine Jimeng 4.0 render time",
    },
  ];

  const experiencePanels = [
    {
      title: "Wallet Telemetry",
      metric: wallet.publicKey ? `${balance.toFixed(3)} SOL` : "—",
      body: wallet.publicKey
        ? "Auto-refreshes whenever you reconnect or mint."
        : "Tap Connect Wallet to sync balances instantly.",
    },
    {
      title: "Generation Status",
      metric: loading ? "Synthesizing..." : imageUrl ? "Preview ready" : "Idle",
      body: loading
        ? "Polling Jimeng endpoints with retry-aware workers."
        : imageUrl
          ? "Scroll up to see the rendered pixel frame."
          : "Feed the prompt panel to begin.",
    },
    {
      title: "Mint Pipeline",
      metric: mintLoading ? "Signing..." : nftMinted ? "Done" : "Awaiting art",
      body: mintLoading
        ? "Umi signs & uploads metadata to Irys automatically."
        : nftMinted
          ? "Your NFT is live—share the explorer link."
          : "Generate a meme, ensure balance ≥ 0.05 SOL.",
    },
  ];

  const timelineActive = TIMELINE_STEPS[activeTimelineStep];

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white font-body">
      <div className="torii-backdrop" aria-hidden />
      <div className="pointer-events-none absolute inset-0">
        <div className="cyber-grid bg-transparent" aria-hidden />
        <div className="neon-orb neon-orb--pink opacity-30" aria-hidden />
        <div className="neon-orb neon-orb--teal opacity-26" aria-hidden />
        <div className="neon-orb neon-orb--amber opacity-26" aria-hidden />
      </div>

      <header className="relative z-30 border-b border-white/10 bg-[#1a031ae0] backdrop-blur-2xl">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs uppercase tracking-[0.35em] text-white/70">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/25 px-3 py-1 text-[0.55rem] tracking-[0.4em] text-[#c4b5fd]/80">
              Control Room
            </span>
            <span className="rounded-full border border-white/25 px-3 py-1 text-[0.55rem] tracking-[0.4em] text-[#fbbf24]/80">
              Live Devnet
            </span>
          </div>

          <button
            onClick={scrollToGenerator}
            className="rounded-full border border-white/30 px-4 py-2 text-[0.55rem] tracking-[0.35em] text-white transition hover:border-[#fbbf24] hover:text-[#fbbf24]"
          >
            START FLOW
          </button>
        </div>
      </header>

      <main className="relative z-20 space-y-24 pb-24">
        <section className="container px-4 pt-24 lg:pt-32">
          <div className="rounded-[36px] border border-[#ff2e49]/25 bg-[rgba(30,5,10,0.4)] p-6 shadow-[0_60px_140px_rgba(80,0,20,0.45)] backdrop-blur-xl sm:p-12">
            <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3 text-[0.55rem] uppercase tracking-[0.45em] text-[#c4b5fd]">
                  {HERO_BADGES.map((badge) => (
                    <span
                      key={badge}
                  className="rounded-full border border-[#8b5cf6]/30 px-4 py-2 text-[0.55rem] tracking-[0.35em] bg-[#0f0f23]/60"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <NeonTitle>STALKGEN NFT</NeonTitle>

                <p className="max-w-2xl font-body text-lg text-[#ffd6a3]/85 md:text-2xl">
                  Prompt your cyberpunk meme, stream Volcengine Jimeng 4.0
                  renders, then mint straight to Solana with Umi + Irys in one
                  cinematic flow.
                </p>

                <div className="flex flex-wrap gap-4">
                  <PixelButton onClick={scrollToGenerator}>
                    FORGE A MEME
                  </PixelButton>

                  <PixelButton
                    className="!bg-[rgba(10,0,26,0.8)]"
                    isWalletConnectButton={!wallet.publicKey}
                    onClick={wallet.publicKey ? checkBalance : undefined}
                  >
                    {wallet.publicKey ? "REFRESH BALANCE" : "CONNECT WALLET"}
                  </PixelButton>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[#ff2e49]/20 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_0_25px_rgba(255,46,73,0.1)] backdrop-blur-lg transition hover:border-[#ffd166] hover:shadow-[0_0_35px_rgba(255,209,102,0.25)]"
                    >
                      <p className="text-[0.55rem] font-heading uppercase tracking-[0.35em] text-[#ffd6a3]/80 neon-text-yellow">
                        {stat.label}
                      </p>
                      <p className="mt-3 font-heading text-3xl text-[#fff3d6] tracking-[0.18em] neon-text-amber">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-[#ffe6ba]/80 font-body">
                        {stat.href ? (
                          <a
                            href={stat.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#ffd166] underline decoration-dotted hover:text-white"
                          >
                            {stat.helper}
                          </a>
                        ) : (
                          stat.helper
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-[#ff2e4925] bg-gradient-to-br from-[#150104]/35 via-[#090006]/45 to-[#05000a]/60 p-6 shadow-[0_0_50px_rgba(255,46,73,0.25)]">
                  <div className="flex items-center justify-between text-[0.55rem] font-heading uppercase tracking-[0.3em] text-[#ffd6a3]/80">
                    <span>Torii Flow Timeline</span>
                    <span>
                      Step {activeTimelineStep + 1}/{TIMELINE_STEPS.length}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {TIMELINE_STEPS.map((step, index) => {
                      const isActive = index === activeTimelineStep;
                      return (
                        <button
                          key={step.title}
                          type="button"
                          tabIndex={0}
                          onMouseEnter={() => setActiveTimelineStep(index)}
                          onFocus={() => setActiveTimelineStep(index)}
                          className={`group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all ${
                            isActive
                              ? "border-[#ffd166] bg-[#ffd16622] shadow-[0_0_45px_rgba(255,209,102,0.25)]"
                              : "border-[#ff2e4922] bg-[#0a0004]/70 hover:border-[#ff2e49]"
                          }`}
                        >
                          <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-70"
                            style={{ background: step.accent }}
                            aria-hidden
                          />
                          <div className="relative flex items-center gap-4">
                            <div>
                              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-[#ffd6a3]/60">
                                Step {index + 1}
                              </p>
                              <p className="text-2xl font-heading text-[#fff6d8] tracking-[0.25em]">
                                {step.title}
                              </p>
                              <p className="text-sm text-white/70 font-body">
                                {step.caption}
                              </p>
                            </div>
                            <span className="ml-auto text-3xl text-[#ffd166]">
                              {step.emoji}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#ff2e4922] bg-[#090105]/80 p-4">
                    <p className="text-[0.55rem] uppercase tracking-[0.35em] text-[#ffd6a3]/70">
                      Now Focused
                    </p>
                    <p className="mt-3 text-lg text-[#ffe5bd]/85 font-body">
                      {timelineActive.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#ff2e4933] bg-[#0a0004]/75 p-6">
                  <p className="text-[0.55rem] uppercase tracking-[0.35em] text-[#ffd6a3]/70">
                    Torii Status Feed
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-[#ffe9c2]/80 font-body">
                    <li className="flex items-center justify-between gap-4">
                      <span>Wallet Sync</span>
                      <span>
                        {wallet.publicKey
                          ? `${wallet.publicKey
                              .toBase58()
                              .slice(0, 4)}…${wallet.publicKey
                              .toBase58()
                              .slice(-4)}`
                          : "Disconnected"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-4">
                      <span>Generator</span>
                      <span>
                        {loading
                          ? "Synthesizing"
                          : imageUrl
                            ? "Preview Ready"
                            : "Idle"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-4">
                      <span>Mint</span>
                      <span>
                        {mintLoading
                          ? "Processing"
                          : nftMinted
                            ? "Completed"
                            : "Awaiting"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={generatorRef}
          className="container px-4"
          aria-label="Generator workspace"
        >
          <div className="grid gap-10 xl:grid-cols-2">
            <div className="flex justify-center xl:justify-start">
              <GenerateNFTPanel
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={generateMeme}
                loading={loading}
                error={error}
                walletPublicKey={
                  isClient && wallet.publicKey
                    ? wallet.publicKey.toBase58()
                    : null
                }
                balance={balance}
                balanceLoading={balanceLoading}
                onMint={mintNFT}
                mintLoading={mintLoading}
                nftMinted={nftMinted}
                nftAddress={nftAddress}
                solscanLink={solscanLink}
                style={style}
                setStyle={setStyle}
                panelClassName="max-w-full min-w-0"
              />
            </div>

            <div className="flex justify-center xl:justify-end">
              <NFTPreviewPanel
                imageUrl={imageUrl}
                style={style}
                panelClassName="max-w-full min-w-0"
              />
            </div>
          </div>
        </section>

        <section className="container px-4">
          <div className="rounded-[32px] border border-[#ff2e4933] bg-gradient-to-br from-[#150105]/75 via-[#070003]/85 to-[#020006]/90 p-6 sm:p-10 shadow-[0_0_70px_rgba(40,0,10,0.7)] backdrop-blur-lg">
            <div className="grid gap-6 md:grid-cols-3">
              {experiencePanels.map((panel) => (
                <div
                  key={panel.title}
                  className="rounded-3xl border border-[#ff2e4933] bg-[#070003]/85 p-6 shadow-[0_20px_50px_rgba(80,0,15,0.45)] transition hover:border-[#ffd166]/80"
                >
                  <p className="text-[0.55rem] font-heading uppercase tracking-[0.35em] text-[#ffd6a3]/80">
                    {panel.title}
                  </p>
                  <p className="mt-4 font-heading text-4xl text-[#fff3d6] tracking-[0.15em]">
                    {panel.metric}
                  </p>
                  <p className="mt-3 text-sm text-[#ffe6ba]/85 font-body leading-relaxed">
                    {panel.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section className="container relative z-20 mt-12 px-4">
        <div className="rounded-[28px] border border-[#ffd166]/50 bg-gradient-to-r from-[#1a0204]/70 via-[#0b0004]/85 to-[#040008]/92 p-8 text-center shadow-[0_30px_90px_rgba(60,0,10,0.7)]">
          <p className="text-[0.6rem] font-heading uppercase tracking-[0.35em] text-[#ffd6a3]/85">
            Final Call
          </p>
          <h2 className="mt-4 font-heading text-4xl uppercase tracking-[0.2em] text-[#fff1ce]">
            Forge Your Meme On-Chain
          </h2>
          <p className="mt-3 text-base text-[#ffe6ba]/85 font-body">
            Prompt → Render → Mint, orchestrated in one neon control deck.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <PixelButton onClick={scrollToGenerator}>GENERATE NOW</PixelButton>
            <PixelButton
              className="!bg-[rgba(30,2,4,0.85)]"
              isWalletConnectButton={!wallet.publicKey}
              onClick={wallet.publicKey ? checkBalance : undefined}
            >
              {wallet.publicKey ? "CHECK STATUS" : "SYNC WALLET"}
            </PixelButton>
          </div>
        </div>
      </section>

      <footer className="relative z-20 mt-12 border-t border-[#8b5cf633] bg-[#04000c]/80 px-4 py-8 text-center text-sm text-white/60">
        StalkGen NFT · AI-powered cyberpunk meme forge on Solana.
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <WalletProviderWrapper>
        <HomeContent />
      </WalletProviderWrapper>
    </div>
  );
}

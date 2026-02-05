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
      "linear-gradient(120deg, rgba(255,0,204,0.4), rgba(255,234,0,0.15))",
    emoji: "⌨️",
  },
  {
    title: "Synthesize",
    caption: "AI renders pixels",
    description:
      "We fan out async jobs to Jimeng 4.0, poll for completions, and normalize the asset for the preview frame.",
    accent:
      "linear-gradient(120deg, rgba(0,240,255,0.35), rgba(153,102,255,0.2))",
    emoji: "⚙️",
  },
  {
    title: "Verify",
    caption: "Wallet + balance check",
    description:
      "Your Phantom/Solflare wallet stays in sync—SOL balance + permissions are validated before minting.",
    accent:
      "linear-gradient(120deg, rgba(255,204,0,0.35), rgba(255,102,0,0.2))",
    emoji: "🔐",
  },
  {
    title: "Mint",
    caption: "On-chain forever",
    description:
      "Metadata uploads via Irys, then Umi signs the mint tx so your pixel meme lives on Solana forever.",
    accent:
      "linear-gradient(120deg, rgba(0,255,170,0.35), rgba(0,128,255,0.2))",
    emoji: "🚀",
  },
];

// Reusable component: Neon Title
const NeonTitle = ({ children }: { children: React.ReactNode }) => (
  <h1
    className="text-7xl md:text-8xl lg:text-9xl font-bold glitch neon-text"
    data-text={String(children)}
    aria-label={String(children)}
    style={{
      textShadow:
        "0 0 15px #9966ff, 0 0 30px #9966ff, 0 0 45px #9966ff, 0 0 60px #9966ff, 0 0 75px #9966ff",
      color: "#ffffff",
      letterSpacing: "2px",
    }}
  >
    {children}
  </h1>
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
    <div className="relative min-h-screen overflow-hidden bg-[#030014] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="cyber-grid" aria-hidden />
        <div className="neon-orb neon-orb--pink" aria-hidden />
        <div className="neon-orb neon-orb--teal" aria-hidden />
        <div className="neon-orb neon-orb--amber" aria-hidden />
      </div>

      <header className="relative z-30 border-b border-white/10 bg-[#030014bb] backdrop-blur-xl">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm uppercase tracking-[0.3em] text-white/70">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 px-3 py-1">
              Control Room
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1">
              Live Devnet
            </span>
          </div>

          <button
            onClick={scrollToGenerator}
            className="rounded-full border border-white/30 px-4 py-2 text-xs tracking-[0.4em] text-white transition hover:border-[#ffea00] hover:text-[#ffea00]"
          >
            START FLOW
          </button>
        </div>
      </header>

      <main className="relative z-20 space-y-24 pb-24">
        <section className="container px-4 pt-24 lg:pt-28">
          <div className="rounded-[36px] border border-white/10 bg-white/5/40 bg-gradient-to-br from-[#120020]/80 via-[#0a0020]/70 to-[#050011]/90 p-6 shadow-[0_50px_120px_rgba(0,0,0,0.45)] sm:p-10">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
                  {HERO_BADGES.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/20 px-4 py-2 text-[0.6rem] tracking-[0.4em]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <NeonTitle>STALKGEN NFT</NeonTitle>

                <p className="max-w-2xl text-lg text-white/70 md:text-2xl">
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
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/30"
                    >
                      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/50">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl text-white">{stat.value}</p>
                      <p className="mt-1 text-sm text-white/60">
                        {stat.href ? (
                          <a
                            href={stat.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#ffea00] underline decoration-dotted hover:text-white"
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
                <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-transparent to-transparent p-6 shadow-[0_0_40px_rgba(255,0,204,0.15)]">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                    <span>Flow Timeline</span>
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
                              ? "border-[#ffea00] bg-white/10 shadow-[0_0_30px_rgba(255,234,0,0.25)]"
                              : "border-white/10 bg-white/[0.03] hover:border-white/30"
                          }`}
                        >
                          <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-50"
                            style={{ background: step.accent }}
                            aria-hidden
                          />
                          <div className="relative flex items-center gap-4">
                            <div>
                              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">
                                Step {index + 1}
                              </p>
                              <p className="text-2xl text-white">
                                {step.title}
                              </p>
                              <p className="text-sm text-white/60">
                                {step.caption}
                              </p>
                            </div>
                            <span className="ml-auto text-3xl">
                              {step.emoji}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">
                      Now Focused
                    </p>
                    <p className="mt-3 text-lg text-white/80">
                      {timelineActive.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/15 bg-black/40/80 p-6">
                  <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">
                    Status Feed
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    <li className="flex items-center justify-between gap-4">
                      <span>Wallet</span>
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
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-transparent p-6 sm:p-10">
            <div className="grid gap-6 md:grid-cols-3">
              {experiencePanels.map((panel) => (
                <div
                  key={panel.title}
                  className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">
                    {panel.title}
                  </p>
                  <p className="mt-4 text-4xl text-white">{panel.metric}</p>
                  <p className="mt-3 text-sm text-white/70">{panel.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-white/10 bg-black/50 px-4 py-8 text-center text-sm text-white/60">
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

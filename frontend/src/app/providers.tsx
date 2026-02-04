"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

// Import wallet adapter default styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderWrapperProps {
  children: React.ReactNode;
}

export function WalletProviderWrapper({
  children,
}: WalletProviderWrapperProps) {
  // Check if running on client side
  const isClient = typeof window !== "undefined";

  // On client side, use full wallet provider
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () =>
      isClient
        ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
        : "",
    [network, isClient],
  );

  // Create the wallet adapters we need
  // Set up according to the wallet-adapter documentation standards
  const wallets = useMemo(() => {
    return isClient
      ? [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })]
      : [];
  }, [network, isClient]);

  // On server side, return a simple wrapper
  if (!isClient) {
    return <>{children}</>;
  }

  // Set up WalletProvider according to the wallet-adapter documentation standards
  // Using standard WalletProvider instead of custom wrapper
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

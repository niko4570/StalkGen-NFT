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

// 导入钱包适配器的默认样式
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderWrapperProps {
  children: React.ReactNode;
}

export function WalletProviderWrapper({
  children,
}: WalletProviderWrapperProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
    [network],
  );

  // 创建我们需要的钱包适配器
  // 按照wallet-adapter文档中的标准方式设置
  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })];
  }, [network]);

  // 按照wallet-adapter文档中的标准方式设置WalletProvider
  // 使用标准的WalletProvider而不是自定义的包装器
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

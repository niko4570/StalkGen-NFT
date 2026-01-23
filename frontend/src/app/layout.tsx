import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProviderWrapper } from "./providers";
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StalkGen NFT - 梗图生成器",
  description: "使用 AI 生成梗图并一键 Mint 为 NFT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <WalletProviderWrapper>
          {children}
        </WalletProviderWrapper>
      </body>
    </html>
  );
}

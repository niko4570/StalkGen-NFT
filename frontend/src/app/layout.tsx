import type { Metadata } from "next";
import "./globals.css";

// 移除 @solana/wallet-adapter-react-ui/styles.css 导入，因为它会在服务器端执行客户端逻辑

// 不使用 Inter 字体，使用全局 CSS 中定义的 VT323 字体
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
      <body>{children}</body>
    </html>
  );
}

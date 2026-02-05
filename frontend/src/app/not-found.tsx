// 移除 'use client' 指令，确保这是一个纯服务器组件
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1
          className="text-6xl font-bold text-white mb-4"
          style={{
            textShadow: "0 0 10px #9966ff",
            fontFamily: "VT323, monospace",
          }}
        >
          404
        </h1>
        <p
          className="text-xl text-gray-300 mb-8"
          style={{ fontFamily: "VT323, monospace" }}
        >
          Page not found
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[rgba(26,13,46,0.7)] text-white border-2 border-[#ffcc00] hover:border-[#ffea00] transition-colors"
          style={{
            textShadow: "0 0 4px #ffcc00",
            fontFamily: "VT323, monospace",
          }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

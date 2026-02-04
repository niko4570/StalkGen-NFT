"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1
          className="text-6xl font-bold text-white mb-4 font-vt323"
          style={{ textShadow: "0 0 10px #ff3366" }}
        >
          Error
        </h1>
        <p className="text-xl text-gray-300 mb-8 font-vt323">
          Something went wrong
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[rgba(26,13,46,0.7)] text-white font-vt323 border-2 border-[#ffcc00] hover:border-[#ffea00] transition-colors"
          style={{ textShadow: "0 0 4px #ffcc00" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

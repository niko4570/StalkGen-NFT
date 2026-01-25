'use client';

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">500</h1>
        <p className="text-xl text-gray-600 mb-4">服务器错误</p>
        <p className="text-gray-500 mb-8">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
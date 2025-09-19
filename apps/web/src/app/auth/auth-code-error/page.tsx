"use client";

import { useRouter } from "next/navigation";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            로그인 중 오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-4">
            카카오 로그인 처리 중 문제가 발생했습니다. 잠시 후 로그인 페이지로
            이동합니다.
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-colors"
        >
          로그인 페이지로 이동
        </button>

        <p className="text-sm text-gray-500 mt-3">
          문제가 계속 발생하면 고객센터로 문의해주세요.
        </p>
      </div>
    </div>
  );
}

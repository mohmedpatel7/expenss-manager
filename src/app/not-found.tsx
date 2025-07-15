"use client";
import React from "react";
import { useRouter } from "next/navigation";

const NotFound: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr  p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="7" width="18" height="10" rx="3" fill="#2563eb" />
              <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff" />
            </svg>
          </div>
          <h1 className="text-6xl font-extrabold text-[#2563eb] tracking-tight">
            404
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Page Not Found
        </h2>
        <p className="text-[#83949b] text-center mb-6">
          Oops! The page you are looking for doesn&apos;t exist or has been
          moved.
          <br />
          Let&apos;s get you back to managing your expenses!
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;

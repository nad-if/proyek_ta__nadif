"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#1E1E2D] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        {/* Kiri: Teks */}
        <div className="flex-1 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Monitor
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#B4B7BD]">
            Kerja, tanpa kekacauan
          </h2>
          <p className="text-lg md:text-xl text-[#B4B7BD] mb-6">
            Dashboard ini membantu Anda mengelola data, perangkat, dan informasi penting dengan mudah dan efisien. Semua fitur terintegrasi dalam satu tempat tanpa kerumitan.
          </p>
          <button
            className="bg-[#7367F0] hover:bg-[#5B50C7] text-white font-semibold px-8 py-3 rounded-lg shadow mb-4 transition"
            onClick={() => router.push("/login")}
          >
            Mulai Sekarang
          </button>
        </div>
        {/* Kanan: Area kosong untuk ilustrasi (bisa diisi nanti) */}
        <div className="flex-1"></div>
      </div>
    </div>
  );
} 
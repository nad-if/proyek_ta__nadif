"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiActivity } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0e111a] flex flex-col">
      {/* Header - Konsisten dengan Dashboard */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#3B4253] bg-[#141824]">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-md bg-[#7367F0] flex items-center justify-center mr-2">
            <FiActivity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">MONITOR</h1>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-[#B4B7BD] hover:text-white px-4 py-2 rounded-lg hover:bg-[#23263a] transition-colors"
        >
          Login
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-7xl w-full">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            {/* Kiri: Teks */}
            <div className="flex-1 flex flex-col items-start">
              <div className="inline-block mb-4 px-4 py-2 bg-[#7367F0]/20 border border-[#7367F0]/30 rounded-full">
                <span className="text-[#7367F0] text-sm font-semibold">SDR Monitoring System</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight">
                MONITOR
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#B4B7BD]">
                Pantau sistem SDR secara real-time
              </h2>
              <p className="text-lg md:text-xl text-[#B4B7BD] mb-8 leading-relaxed max-w-2xl">
                Dashboard ini membantu Anda memantau data power, status PTT, dan pengukuran Return Loss dari sistem SDR secara real-time untuk analisis dan monitoring yang lebih efektif.
              </p>
              <button
                className="bg-[#7367F0] hover:bg-[#5B50C7] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => router.push("/login")}
              >
                Mulai Sekarang
              </button>
            </div>
            
            {/* Kanan: Visual/Ilustrasi */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Gradient Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7367F0]/20 to-[#29B6F6]/20 rounded-full blur-3xl"></div>
                
                {/* Card Preview */}
                <div className="relative bg-[#0e111a] border border-[#3B4253] rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#00E676] rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-semibold">Live Monitoring</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                      <span className="text-white text-xs">Power (dB)</span>
                    </div>
                  </div>
                  {/* Grafik Line Chart Preview */}
                  <div className="h-[200px] relative">
                    <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3A3B64" strokeWidth="1" opacity="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Horizontal grid lines */}
                      <line x1="0" y1="40" x2="400" y2="40" stroke="#3A3B64" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="#3A3B64" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="#3A3B64" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      <line x1="0" y1="160" x2="400" y2="160" stroke="#3A3B64" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      
                      {/* Y-axis labels */}
                      <text x="5" y="25" fill="#B4B7BD" fontSize="10" textAnchor="start">0</text>
                      <text x="5" y="65" fill="#B4B7BD" fontSize="10" textAnchor="start">-20</text>
                      <text x="5" y="105" fill="#B4B7BD" fontSize="10" textAnchor="start">-40</text>
                      <text x="5" y="145" fill="#B4B7BD" fontSize="10" textAnchor="start">-60</text>
                      <text x="5" y="185" fill="#B4B7BD" fontSize="10" textAnchor="start">-80</text>
                      
                      {/* Line Chart - Sample data points untuk preview */}
                      <path
                        d="M 20 80 L 60 90 L 100 75 L 140 85 L 180 70 L 220 95 L 260 65 L 300 88 L 340 72 L 380 82"
                        fill="none"
                        stroke="#7367F0"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Dots on line */}
                      <circle cx="20" cy="80" r="3" fill="#7367F0" />
                      <circle cx="60" cy="90" r="3" fill="#7367F0" />
                      <circle cx="100" cy="75" r="3" fill="#7367F0" />
                      <circle cx="140" cy="85" r="3" fill="#7367F0" />
                      <circle cx="180" cy="70" r="3" fill="#7367F0" />
                      <circle cx="220" cy="95" r="3" fill="#7367F0" />
                      <circle cx="260" cy="65" r="3" fill="#7367F0" />
                      <circle cx="300" cy="88" r="3" fill="#7367F0" />
                      <circle cx="340" cy="72" r="3" fill="#7367F0" />
                      <circle cx="380" cy="82" r="3" fill="#7367F0" />
                      
                      {/* X-axis labels */}
                      <text x="20" y="195" fill="#B4B7BD" fontSize="9" textAnchor="middle">10:00</text>
                      <text x="140" y="195" fill="#B4B7BD" fontSize="9" textAnchor="middle">10:05</text>
                      <text x="260" y="195" fill="#B4B7BD" fontSize="9" textAnchor="middle">10:10</text>
                      <text x="380" y="195" fill="#B4B7BD" fontSize="9" textAnchor="middle">10:15</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
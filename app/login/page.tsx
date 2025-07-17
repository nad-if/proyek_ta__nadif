"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy authentication: email = admin, password = admin
    if (email === "admin" && password === "admin") {
      setError("");
      router.push("/dashboard");
    } else {
      setError("Email atau password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2D] flex items-center justify-center py-12 px-4">
      <div className="bg-[#0e111a] p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center border border-[#3B4253]">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#7367F0] text-center">Login</h2>
        <p className="text-[#B4B7BD] mb-6 text-center text-base">Masuk ke dashboard untuk mulai memonitor data dan perangkat Anda.</p>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-[#B4B7BD]">Email</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7367F0] bg-[#F4F6FB] text-[#23263a]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-[#B4B7BD]">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7367F0] bg-[#F4F6FB] text-[#23263a]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-[#7367F0] hover:bg-[#5B50C7] text-white font-semibold py-2 rounded-lg shadow transition mb-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 
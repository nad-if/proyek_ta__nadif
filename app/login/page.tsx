"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiActivity } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulasi delay untuk UX yang lebih baik
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dummy authentication: email = admin, password = admin
    if (email === "admin" && password === "admin") {
      setError("");
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      router.push("/dashboard");
    } else {
      setError("Email atau password salah!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2D] flex items-center justify-center py-12 px-4">
      <div className="bg-[#0e111a] p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center border border-[#3B4253] backdrop-blur-sm">
        {/* Logo di atas form */}
        <div className="mb-4">
          <div className="w-14 h-14 rounded-xl bg-[#7367F0] flex items-center justify-center mb-4 shadow-lg">
            <FiActivity className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#7367F0] text-center">
          Login
        </h2>
        <p className="text-[#B4B7BD] mb-8 text-center text-sm md:text-base px-2">
          Masuk ke dashboard untuk mulai memonitor data dan perangkat Anda.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold text-[#B4B7BD]"
            >
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] w-5 h-5" />
              <input
                id="email"
                type="text"
                placeholder="Masukkan username atau email"
                className="w-full border border-[#3B4253] rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50 focus:border-[#7367F0] bg-[#141824] text-white placeholder:text-[#676D7D] transition-all"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-[#B4B7BD]"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] w-5 h-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password Anda"
                className="w-full border border-[#3B4253] rounded-lg px-10 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50 focus:border-[#7367F0] bg-[#141824] text-white placeholder:text-[#676D7D] transition-all"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] hover:text-[#B4B7BD] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#3B4253] bg-[#141824] text-[#7367F0] focus:ring-2 focus:ring-[#7367F0]/50 focus:ring-offset-0 cursor-pointer"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-[#B4B7BD] group-hover:text-white transition-colors">
                Ingat saya
              </span>
            </label>
            <button
              type="button"
              className="text-sm text-[#7367F0] hover:text-[#8B7FF0] transition-colors focus:outline-none"
              disabled={isLoading}
            >
              Lupa password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7367F0] hover:bg-[#5B50C7] disabled:bg-[#5B50C7] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 
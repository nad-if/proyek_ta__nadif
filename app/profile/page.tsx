'use client';

import Link from 'next/link';
import { 
  FiHome, FiSettings, FiBell, 
  FiSearch, FiSun, FiMenu, FiUser,
  FiMail, FiPhone, FiMapPin, FiEdit3,
  FiShield, FiKey, FiEye, FiEyeOff
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { useState, useRef, useEffect } from 'react';

export default function Profile() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains((event.target as Node) ?? null)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="flex flex-col h-screen bg-[#0e111a]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#3B4253] bg-[#141824]">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-md bg-[#EA5455] flex items-center justify-center mr-2">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 0L14 6H10V12L4 6H8V0L7 0Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">MONITOR</h1>
        </div>
        
        <div className="relative max-w-xl w-full mx-10">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#0e111a] border border-[#3B4253] rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-[#B4B7BD] hover:text-white p-1">
            <FiSun className="w-5 h-5" />
          </button>
          <button className="text-[#B4B7BD] hover:text-white p-1">
            <FiBell className="w-5 h-5" />
          </button>
          <button className="text-[#B4B7BD] hover:text-white p-1">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 hover:bg-[#23263a] transition-colors duration-150 rounded-lg px-2 py-1 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span className="text-white font-medium text-sm">Nadif Aulia Putra</span>
              <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
                <img
                  src="https://drive.google.com/uc?export=view&id=1d55RWKLnOWHrLu_IfmJRZ-mbTKjjqMBq"
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#181b28] border border-[#23263a] rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-white hover:bg-[#23263a] rounded-lg transition-colors duration-100"
                >
                  Edit Profile
                </a>
                <button
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#23263a] rounded-lg transition-colors duration-100"
                  onClick={() => alert('Logout')}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-[#B4B7BD] mt-1">Kelola informasi profil dan keamanan akun Anda</p>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <div className="lg:col-span-2">
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Informasi Profil</h3>
                      <button className="flex items-center text-[#7367F0] hover:text-[#7367F0]/80">
                        <FiEdit3 className="mr-2" size={16} />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-[#7367F0] flex items-center justify-center">
                          <img
                            src="https://drive.google.com/uc?export=view&id=1AbCDefGhIjKlMnOpQrStUvWxYz"
                            alt="Profile"
                            className="rounded-full w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <button className="bg-[#7367F0] text-white px-4 py-2 rounded-md text-sm hover:bg-[#7367F0]/90">
                            Ganti Foto
                          </button>
                          <p className="text-[#B4B7BD] text-xs mt-1">JPG, PNG atau GIF. Maksimal 2MB.</p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            defaultValue="Nadif Aulia Putra"
                            className="w-full bg-[#141824] border border-[#3B4253] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            defaultValue="nadif"
                            className="w-full bg-[#141824] border border-[#3B4253] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
                            <input
                              type="email"
                              defaultValue="18120036@telecom.stei.itb.ac.id"
                              className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                            Nomor Telepon
                          </label>
                          <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
                            <input
                              type="tel"
                              defaultValue="+62 812-3456-7890"
                              className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                            Alamat
                          </label>
                          <div className="relative">
                            <FiMapPin className="absolute left-3 top-3 text-[#676D7D]" />
                            <textarea
                              defaultValue="Jl. Ganesha No. 10, Bandung, Jawa Barat 40132"
                              rows={3}
                              className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button className="bg-[#7367F0] text-white px-6 py-2 rounded-md hover:bg-[#7367F0]/90">
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Keamanan</h3>
                      <FiShield className="text-[#7367F0]" size={20} />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
                          <input
                            type={showPassword ? "text" : "password"}
                            defaultValue="••••••••"
                            className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] hover:text-white"
                          >
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                          Password Baru
                        </label>
                        <div className="relative">
                          <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
                            className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] hover:text-white"
                          >
                            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#B4B7BD] text-sm font-medium mb-2">
                          Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                          <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676D7D]" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Konfirmasi password baru"
                            className="w-full bg-[#141824] border border-[#3B4253] rounded-md pl-10 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7367F0]/50"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#676D7D] hover:text-white"
                          >
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button className="w-full bg-[#7367F0] text-white px-4 py-2 rounded-md hover:bg-[#7367F0]/90">
                          Ubah Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253] mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Informasi Akun</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#B4B7BD]">Status Akun</span>
                        <span className="text-green-400 font-medium">Aktif</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#B4B7BD]">Bergabung Sejak</span>
                        <span className="text-white">Januari 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#B4B7BD]">Terakhir Login</span>
                        <span className="text-white">2 jam yang lalu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 

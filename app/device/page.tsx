'use client';

import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { 
  FiHome, FiShoppingCart, FiSettings, FiBell, FiPackage, 
  FiSearch, FiSun, FiMenu, FiClock, FiChevronDown, FiActivity
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useState, useRef, useEffect } from 'react';

// Data untuk grafik
const salesData = [
  { name: '01 May', actual: 3200, projected: 2800 },
  { name: '05 May', actual: 3200, projected: 2900 },
  { name: '10 May', actual: 3500, projected: 3000 },
  { name: '15 May', actual: 4000, projected: 3300 },
  { name: '20 May', actual: 5800, projected: 4200 },
  { name: '25 May', actual: 4400, projected: 4700 },
  { name: '30 May', actual: 4100, projected: 4300 },
];

const orderBarData = [
  { name: 'Mon', value: 35 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 30 },
  { name: 'Thu', value: 40 },
  { name: 'Fri', value: 35 },
  { name: 'Sat', value: 45 },
  { name: 'Sun', value: 38 },
];

const newCustomerData = [
  { name: '01 May', value: 100 },
  { name: '02 May', value: 120 },
  { name: '03 May', value: 110 },
  { name: '04 May', value: 130 },
  { name: '05 May', value: 150 },
  { name: '06 May', value: 140 },
  { name: '07 May', value: 160 },
];

// Hapus DeviceSubmenu lama dan ganti dengan versi baru yang menggunakan DeviceDropdown
function DeviceDropdown({ selected, onSelect }: { selected: string, onSelect: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const devices = ['SDR 1', 'SDR 2'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative mt-1 w-full max-w-xs" ref={dropdownRef}>
      <button
        className={`w-full text-left bg-[#181b28] border ${open ? 'border-[#3b82f6]' : 'border-[#3B4253]'} focus:border-[#3b82f6] text-white font-semibold text-base py-2 pl-5 pr-4 rounded-lg flex items-center justify-between transition-colors duration-150 outline-none`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        tabIndex={0}
      >
        {selected || 'Select Device'}
        <svg className="ml-2 w-4 h-4 text-[#B4B7BD]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-full bg-[#181b28] border border-[#3B4253] rounded-lg z-10">
          {devices.map((device) => (
            <button
              key={device}
              className={`block w-full text-left px-5 py-2 text-white font-normal text-base hover:bg-[#3b82f6]/30 focus:bg-[#3b82f6]/30 transition-colors duration-100 ${selected === device ? 'font-semibold' : ''}`}
              onClick={() => {
                onSelect(device);
                setOpen(false);
              }}
              type="button"
            >
              {device}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Ubah DeviceSubmenu agar menerima selectedDevice dari props, bukan dari state lokal
function DeviceSubmenu({ selectedDevice }: { selectedDevice: string }) {
  // Generate random device ID setiap render
  function generateRandomId() {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  const deviceId = generateRandomId();
  return (
    <div className="w-full">
      <div className="bg-[#0e111a] border border-[#3B4253] rounded-lg flex items-center p-12 mb-6 w-full">
        <div className="w-20 h-20 bg-[#7367F0]/20 rounded-full flex items-center justify-center mr-8">
          {/* Ganti ikon dengan SVG laptop outline */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7367F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M2 17h20" />
          </svg>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <span className="text-white font-bold text-3xl">{selectedDevice}</span>
          </div>
          <div className="text-[#B4B7BD] text-xl">Device ID = {deviceId}</div>
        </div>
      </div>
    </div>
  );
}

export default function Device() {
  const [selectedDevice, setSelectedDevice] = useState('SDR 1');
  return (
    <div className="flex flex-col h-screen bg-[#0e111a]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#3B4253] bg-[#141824]">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-md bg-[#7367F0] flex items-center justify-center mr-2">
            <FiActivity className="w-5 h-5 text-white" />
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
          <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
            <img
              src="/Google Profile.jpg"
              alt="Profile"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {/* Dropdown di atas DeviceSubmenu */}
            <DeviceDropdown selected={selectedDevice} onSelect={setSelectedDevice} />
            {/* DeviceSubmenu menerima selectedDevice sebagai prop */}
            <DeviceSubmenu selectedDevice={selectedDevice} />
          </div>
        </main>
      </div>
    </div>
  );
} 
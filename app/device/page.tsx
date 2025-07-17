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
import { useState } from 'react';

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

function DeviceSubmenu() {
  // Dropdown device
  const [selectedDevice, setSelectedDevice] = useState('SDR 1');
  const devices = ['SDR 1', 'SDR 2'];
  // Generate random device ID setiap render
  function generateRandomId() {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  const deviceId = generateRandomId();
  return (
    <div className="w-full">
      <div className="bg-[#0e111a] border border-[#3B4253] rounded-lg flex items-center p-12 mb-6 w-full">
        <div className="w-20 h-20 bg-[#7367F0]/20 rounded-full flex items-center justify-center mr-8">
          <FiActivity className="w-12 h-12 text-[#7367F0]" />
        </div>
        <div>
          <div className="flex items-center mb-2">
            <select
              className="bg-transparent text-white font-bold text-3xl outline-none appearance-none pr-6"
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
            >
              {devices.map(device => (
                <option key={device} value={device} className="text-black">{device}</option>
              ))}
            </select>
          </div>
          <div className="text-[#B4B7BD] text-xl">Device ID = {deviceId}</div>
        </div>
      </div>
    </div>
  );
}

export default function Device() {
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
            {/* Hanya tampilkan DeviceSubmenu */}
            <DeviceSubmenu />
          </div>
        </main>
      </div>
    </div>
  );
} 
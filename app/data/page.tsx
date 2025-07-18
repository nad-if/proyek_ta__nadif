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
import { useState, useRef } from 'react';
import React from 'react'; // Added missing import for React
import { DEVICE_IDS } from './deviceIds';

type DeviceName = keyof typeof DEVICE_IDS;

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

type DataProps = {};
export default function Data(props: DataProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceName>('SDR 1');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const devices = ['SDR 1', 'SDR 2'];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
            <FiBell className="w-5 h-5" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 rounded-lg px-2 py-1 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
                <img
                  src="/Google Profile.jpg"
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
                  onClick={() => { window.location.href = '/'; }}
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
            <div className="bg-[#0e111a] rounded-lg border border-[#3B4253] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Data Table</h2>
                <div className="relative w-64" ref={dropdownRef}>
                  <button
                    type="button"
                    className="block w-full text-left px-5 py-2 text-white font-normal text-base border border-[#3B4253] rounded-lg bg-[#23263a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-colors duration-100"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {selectedDevice}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <FiChevronDown className="text-[#B4B7BD] w-5 h-5" />
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-[#181b28] border border-[#3B4253] rounded-lg z-10 shadow-lg">
                      {devices.map(device => (
                        <button
                          key={device}
                          type="button"
                          className={`block w-full text-left px-5 py-2 text-white font-normal text-base hover:bg-[#3b82f6]/30 focus:bg-[#3b82f6]/30 transition-colors duration-100 ${selectedDevice === device ? 'font-semibold' : ''}`}
                          onClick={() => {
                            setSelectedDevice(device as DeviceName);
                            setDropdownOpen(false);
                          }}
                        >
                          {device}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full rounded-lg">
                  <thead className="bg-[#141824]">
                    <tr>
                      <th className="px-4 py-2 border-b border-[#23263a] text-left text-[#B4B7BD] font-semibold">Device ID</th>
                      <th className="px-4 py-2 border-b border-[#23263a] text-left text-[#B4B7BD] font-semibold">Time</th>
                      <th className="px-4 py-2 border-b border-[#23263a] text-left text-[#B4B7BD] font-semibold">Frequency</th>
                      <th className="px-4 py-2 border-b border-[#23263a] text-left text-[#B4B7BD] font-semibold">Power (dB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#23263a] transition-colors">
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">{DEVICE_IDS[selectedDevice]}</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">2024-07-23 15:44:59</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">868 MHz</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">14</td>
                    </tr>
                    <tr className="hover:bg-[#23263a] transition-colors">
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">{DEVICE_IDS[selectedDevice]}</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">2024-07-23 15:45:04</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">868 MHz</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">14</td>
                    </tr>
                    <tr className="hover:bg-[#23263a] transition-colors">
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">{DEVICE_IDS[selectedDevice]}</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">2024-07-23 15:45:09</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">868 MHz</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">14</td>
                    </tr>
                    <tr className="hover:bg-[#23263a] transition-colors">
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">{DEVICE_IDS[selectedDevice]}</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">2024-07-23 15:45:14</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">868 MHz</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">14</td>
                    </tr>
                    <tr className="hover:bg-[#23263a] transition-colors">
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">{DEVICE_IDS[selectedDevice]}</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">2024-07-23 15:45:19</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">868 MHz</td>
                      <td className="px-4 py-2 border-b border-[#23263a] text-white">14</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
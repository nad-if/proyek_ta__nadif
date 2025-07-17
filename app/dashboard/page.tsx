'use client';

import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { 
  FiHome, FiSettings, FiBell, 
  FiSearch, FiSun, FiMenu, FiActivity
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { useState, useRef, useEffect } from 'react';

// SDR Data
const sdrData = [
  { timestamp: '11:47:30', power: -20 },
  { timestamp: '11:48:00', power: -65 },
  { timestamp: '11:48:30', power: -65 },
  { timestamp: '11:49:00', power: -65 },
  { timestamp: '11:49:30', power: -60 },
  { timestamp: '11:50:00', power: -60 },
  { timestamp: '11:50:30', power: -60 },
  { timestamp: '11:51:00', power: -60 },
  { timestamp: '11:51:30', power: -50 },
  { timestamp: '11:52:00', power: -70 },
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

export default function DashboardPage() {
  const [selectedDevice, setSelectedDevice] = useState('SDR 1');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 hover:bg-[#23263a] transition-colors duration-150 rounded-lg px-2 py-1 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span className="text-white font-medium text-sm">Nadif Aulia Putra</span>
              <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
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
                <h1 className="mb-2 text-[27px] font-bold text-[#EFF2F6]" style={{ fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
                  Monitoring Dashboard
                </h1>
                {/* Dropdown Select Device */}
                <DeviceDropdown selected={selectedDevice} onSelect={setSelectedDevice} />
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              </div>
              {/* Grafik SDR sesuai device yang dipilih */}
              {selectedDevice === 'SDR 1' && (
                <div className="grid grid-cols-1 gap-6">
                  {/* SDR 1 */}
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">SDR 1</h3>
                        <p className="text-[#B4B7BD] text-sm">Power (dB)</p>
                      </div>
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                          <span className="text-white text-sm">Power (dB)</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sdrData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} />
                          <XAxis 
                            dataKey="timestamp" 
                            stroke="#B4B7BD" 
                            axisLine={false} 
                            tickLine={false} 
                            style={{ fontSize: '10px' }}
                          />
                          <YAxis 
                            stroke="#B4B7BD" 
                            axisLine={false} 
                            tickLine={false}
                            domain={[0, -100]} 
                            ticks={[0, -20, -40, -60, -80, -100]} 
                            style={{ fontSize: '10px' }}
                            tick={(props) => {
                              const { x, y, payload } = props;
                              if (payload.value === 0) {
                                return (
                                  <g transform={`translate(${x},${y})`}>
                                    <text 
                                      x={0} 
                                      y={0} 
                                      dy={4} 
                                      textAnchor="end" 
                                      fill="#FFFFFF" 
                                      fontSize={12}
                                      fontWeight="bold"
                                    >
                                      {payload.value}
                                    </text>
                                  </g>
                                );
                              }
                              return (
                                <g transform={`translate(${x},${y})`}>
                                  <text 
                                    x={0} 
                                    y={0} 
                                    dy={4} 
                                    textAnchor="end" 
                                    fill="#B4B7BD" 
                                    fontSize={10}
                                  >
                                    {payload.value}
                                  </text>
                                </g>
                              );
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0e111a',
                              border: '1px solid #3B4253',
                              borderRadius: '4px',
                            }}
                            formatter={(value) => [`${value} dB`, 'Power']}
                          />
                          <Line
                            type="monotone"
                            dataKey="power"
                            stroke="#7367F0"
                            strokeWidth={2}
                            dot={{ stroke: '#7367F0', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#7367F0', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                          <ReferenceLine
                            y={0}
                            stroke="transparent"
                            label={{
                              value: "0",
                              position: "top",
                              fill: "#B4B7BD",
                              fontSize: 10
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              {selectedDevice === 'SDR 2' && (
                <div className="grid grid-cols-1 gap-6">
                  {/* SDR 2 */}
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">SDR 2</h3>
                        <p className="text-[#B4B7BD] text-sm">Power (dB)</p>
                      </div>
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                          <span className="text-white text-sm">Power (dB)</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sdrData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} />
                          <XAxis 
                            dataKey="timestamp" 
                            stroke="#B4B7BD" 
                            axisLine={false} 
                            tickLine={false} 
                            style={{ fontSize: '10px' }}
                          />
                          <YAxis 
                            stroke="#B4B7BD" 
                            axisLine={false} 
                            tickLine={false}
                            domain={[0, -100]} 
                            ticks={[0, -20, -40, -60, -80, -100]} 
                            style={{ fontSize: '10px' }}
                            tick={(props) => {
                              const { x, y, payload } = props;
                              if (payload.value === 0) {
                                return (
                                  <g transform={`translate(${x},${y})`}>
                                    <text 
                                      x={0} 
                                      y={0} 
                                      dy={4} 
                                      textAnchor="end" 
                                      fill="#FFFFFF" 
                                      fontSize={12}
                                      fontWeight="bold"
                                    >
                                      {payload.value}
                                    </text>
                                  </g>
                                );
                              }
                              return (
                                <g transform={`translate(${x},${y})`}>
                                  <text 
                                    x={0} 
                                    y={0} 
                                    dy={4} 
                                    textAnchor="end" 
                                    fill="#B4B7BD" 
                                    fontSize={10}
                                  >
                                    {payload.value}
                                  </text>
                                </g>
                              );
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0e111a',
                              border: '1px solid #3B4253',
                              borderRadius: '4px',
                            }}
                            formatter={(value) => [`${value} dB`, 'Power']}
                          />
                          <Line
                            type="monotone"
                            dataKey="power"
                            stroke="#7367F0"
                            strokeWidth={2}
                            dot={{ stroke: '#7367F0', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#7367F0', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                          <ReferenceLine
                            y={0}
                            stroke="transparent"
                            label={{
                              value: "0",
                              position: "top",
                              fill: "#B4B7BD",
                              fontSize: 10
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Orders */}
                {/* New Customers */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

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
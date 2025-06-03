'use client';

import Link from 'next/link';
import { 
  FiHome, FiSettings, FiBell, 
  FiSearch, FiSun, FiMenu
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

export default function Home() {
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
          <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Profile"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-[#141824] flex flex-col">
          {/* Navigation */}
          <div className="px-4 pt-3">
            <div className="mb-5">
              <Link href="/" className="flex items-center text-white p-2 rounded-md bg-[#7367F0] hover:bg-[#7367F0]/90">
                <FiHome className="mr-3" size={18} />
                <span>Home</span>
              </Link>
            </div>
            <div className="mb-5">
              <Link href="/home2" className="flex items-center text-[#B4B7BD] p-2 rounded-md hover:bg-[#7367F0]/20 hover:text-white">
                <FiHome className="mr-3" size={18} />
                <span>Home 2</span>
              </Link>
            </div>
            <div className="mb-5">
              <Link href="/settings" className="flex items-center text-[#B4B7BD] p-2 rounded-md hover:bg-[#7367F0]/20 hover:text-white">
                <FiSettings className="mr-3" size={18} />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Collapsed View Button */}
          <div className="mt-auto p-4 border-t border-[#3B4253]">
            <button className="flex items-center text-[#B4B7BD] hover:text-white w-full">
              <FiMenu className="mr-3" size={18} />
              <span>Collapsed View</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-white">Monitoring Dashboard</h1>
                <p className="text-[#B4B7BD] mt-1">Welcome back, here&#39;s what&#39;s going on your monitoring right now</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              </div>

              {/* Total Sells Chart */}
              <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">SDR 1</h3>
                    <p className="text-[#B4B7BD] text-sm">Frequency dan Power (dB)</p>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                      <span className="text-white text-sm">Frequency</span>
                    </div>
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

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Orders */}
                <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Total orders</h3>
                      <p className="text-[#B4B7BD] text-xs">Last 7 days</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[#EA5455] text-sm bg-[#EA5455]/10 px-2 py-1 rounded">-6.8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">16,247</h2>
                  </div>
                  <div className="h-[120px] my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderBarData}>
                        <Bar dataKey="value" fill="#7367F0" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#7367F0] rounded-sm mr-2"></div>
                        <span className="text-[#B4B7BD] text-sm">Completed</span>
                      </div>
                      <span className="text-white text-sm">52%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#B4B7BD]/30 rounded-sm mr-2"></div>
                        <span className="text-[#B4B7BD] text-sm">Pending payment</span>
                      </div>
                      <span className="text-white text-sm">48%</span>
                    </div>
                  </div>
                </div>

                {/* New Customers */}
                <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">New customers</h3>
                      <p className="text-[#B4B7BD] text-xs">Last 7 days</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[#28C76F] text-sm bg-[#28C76F]/10 px-2 py-1 rounded">+26.5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">356</h2>
                  </div>
                  <div className="h-[150px] mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newCustomerData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#7367F0" 
                          strokeWidth={3} 
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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

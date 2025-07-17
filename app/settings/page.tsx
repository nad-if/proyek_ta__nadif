'use client';

import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { 
  FiHome, FiShoppingCart, FiSettings, FiBell, FiPackage, 
  FiSearch, FiSun, FiMenu, FiClock, FiChevronDown
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

export default function Settings() {
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
        <Sidebar />

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
                <div className="bg-[#0e111a] p-4 rounded-lg flex items-center border border-[#3B4253]">
                  <div className="w-12 h-12 bg-[#28C76F]/20 rounded-full flex items-center justify-center mr-4">
                    <FiShoppingCart className="w-6 h-6 text-[#28C76F]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">57 new orders</h3>
                    <p className="text-[#B4B7BD] text-sm">Awaiting processing</p>
                  </div>
                </div>

                <div className="bg-[#0e111a] p-4 rounded-lg flex items-center border border-[#3B4253]">
                  <div className="w-12 h-12 bg-[#FF9F43]/20 rounded-full flex items-center justify-center mr-4">
                    <FiClock className="w-6 h-6 text-[#FF9F43]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">5 orders</h3>
                    <p className="text-[#B4B7BD] text-sm">On hold</p>
                  </div>
                </div>

                <div className="bg-[#0e111a] p-4 rounded-lg flex items-center border border-[#3B4253]">
                  <div className="w-12 h-12 bg-[#EA5455]/20 rounded-full flex items-center justify-center mr-4">
                    <FiPackage className="w-6 h-6 text-[#EA5455]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">15 products</h3>
                    <p className="text-[#B4B7BD] text-sm">Out of stock</p>
                  </div>
                </div>
              </div>

              {/* Total Sells Chart */}
              <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">SDR 1</h3>
                    <p className="text-[#B4B7BD] text-sm">Payment received across all channels</p>
                  </div>
                  <div className="flex items-center bg-[#0e111a] border border-[#3B4253] rounded-md">
                    <button className="flex items-center text-white px-4 py-2">
                      <span>Mar 1 - 31, 2023</span>
                      <FiChevronDown className="ml-2" />
                    </button>
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} />
                      <XAxis dataKey="name" stroke="#B4B7BD" axisLine={false} tickLine={false} />
                      <YAxis stroke="#B4B7BD" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0e111a',
                          border: '1px solid #3B4253',
                          borderRadius: '4px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#7367F0"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#7367F0"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
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
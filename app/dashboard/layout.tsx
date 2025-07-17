'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { FiHome, FiShoppingCart, FiUsers, FiSettings, FiBell, FiUser } from 'react-icons/fi';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-[#1E1E2D]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#25293C] p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Phoenix</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="flex items-center text-[#B4B7BD] hover:text-[#7367F0] p-2 rounded-lg hover:bg-[#2D2E3F]">
                <FiHome className="mr-3" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ecommerce" className="flex items-center text-[#B4B7BD] hover:text-[#7367F0] p-2 rounded-lg hover:bg-[#2D2E3F]">
                <FiShoppingCart className="mr-3" />
                E-commerce
              </Link>
            </li>
            <li>
              <Link href="/dashboard/customers" className="flex items-center text-[#B4B7BD] hover:text-[#7367F0] p-2 rounded-lg hover:bg-[#2D2E3F]">
                <FiUsers className="mr-3" />
                Customers
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" className="flex items-center text-[#B4B7BD] hover:text-[#7367F0] p-2 rounded-lg hover:bg-[#2D2E3F]">
                <FiSettings className="mr-3" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Info */}
        <div className="pt-6 border-t border-[#2D2E3F]">
          <div className="flex items-center text-[#B4B7BD]">
            <div className="w-8 h-8 rounded-full bg-[#7367F0] flex items-center justify-center">
              <FiUser />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs opacity-60">admin@phoenix.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-[#1E1E2D] border-b border-[#2D2E3F] flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-white">Ecommerce Dashboard</h2>
          <div className="flex items-center space-x-4">
            <button className="text-[#B4B7BD] hover:text-[#7367F0]">
              <FiBell className="w-6 h-6" />
            </button>
            <button className="text-[#B4B7BD] hover:text-[#7367F0]">
              <FiSettings className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 
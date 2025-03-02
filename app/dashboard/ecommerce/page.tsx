'use client';

import { FiPackage, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const salesData = [
  { name: '01 May', value: 4000 },
  { name: '15 May', value: 3000 },
  { name: '30 May', value: 2000 },
];

const pieData = [
  { name: 'Completed', value: 72 },
  { name: 'Pending', value: 28 },
];

const COLORS = ['#7367F0', '#2D2E3F'];

const reviews = [
  {
    id: 1,
    product: 'Fitbit Sense Advanced Smartwatch',
    customer: 'Richard Dawkins',
    rating: 5,
    comment: 'This fitbit is fantastic! I was trying to be in better shape and needed some motivation.',
    status: 'APPROVED'
  },
  {
    id: 2,
    product: 'iPhone 13 pro max Pacific Blue 128GB',
    customer: 'Ashley Garrett',
    rating: 4,
    comment: 'The order was delivered ahead of schedule.',
    status: 'PENDING'
  },
];

const EcommerceDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2D2E3F] p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B4B7BD] text-sm">New Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">57</h3>
            </div>
            <div className="w-12 h-12 bg-[#7367F0]/20 rounded-full flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-[#7367F0]" />
            </div>
          </div>
          <p className="text-[#28C76F] text-sm mt-4">+18.2% vs last month</p>
        </div>

        <div className="bg-[#2D2E3F] p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B4B7BD] text-sm">Pending Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">5</h3>
            </div>
            <div className="w-12 h-12 bg-[#FF9F43]/20 rounded-full flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-[#FF9F43]" />
            </div>
          </div>
          <p className="text-[#EA5455] text-sm mt-4">-4.5% vs last month</p>
        </div>

        <div className="bg-[#2D2E3F] p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B4B7BD] text-sm">Products Out of Stock</p>
              <h3 className="text-2xl font-bold text-white mt-1">15</h3>
            </div>
            <div className="w-12 h-12 bg-[#EA5455]/20 rounded-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-[#EA5455]" />
            </div>
          </div>
          <p className="text-[#EA5455] text-sm mt-4">+2.4% vs last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Sales Chart */}
        <div className="bg-[#2D2E3F] p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Total Sales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" />
                <XAxis dataKey="name" stroke="#B4B7BD" />
                <YAxis stroke="#B4B7BD" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2D2E3F',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7367F0"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-[#2D2E3F] p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2D2E3F',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#7367F0] mr-2" />
                <span className="text-[#B4B7BD] text-sm">Completed (72%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2D2E3F] mr-2" />
                <span className="text-[#B4B7BD] text-sm">Pending (28%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Reviews */}
      <div className="bg-[#2D2E3F] rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Latest Reviews</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#3A3B64]">
                  <th className="pb-3 text-[#B4B7BD] font-medium">Product</th>
                  <th className="pb-3 text-[#B4B7BD] font-medium">Customer</th>
                  <th className="pb-3 text-[#B4B7BD] font-medium">Rating</th>
                  <th className="pb-3 text-[#B4B7BD] font-medium">Comment</th>
                  <th className="pb-3 text-[#B4B7BD] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b border-[#3A3B64] last:border-0">
                    <td className="py-4 text-white">{review.product}</td>
                    <td className="py-4 text-white">{review.customer}</td>
                    <td className="py-4">
                      <div className="flex text-[#FF9F43]">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                    </td>
                    <td className="py-4 text-white">{review.comment}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          review.status === 'APPROVED'
                            ? 'bg-[#28C76F]/20 text-[#28C76F]'
                            : 'bg-[#FF9F43]/20 text-[#FF9F43]'
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceDashboard; 
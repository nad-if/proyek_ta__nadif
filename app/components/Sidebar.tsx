import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-[#141824] flex flex-col">
      <nav className="px-2 pt-3">
        <ul className="navbar-nav space-y-2">
          <li>
            <Link
              href="/"
              className={`flex items-center justify-between transition-all duration-200 ${pathname === '/' ? 'rounded-full' : 'rounded-md hover:rounded-full hover:bg-[#23263a]'}`}
              style={pathname === '/' ? {
                background: '#2C3242',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              } : {
                color: '#9FA6BC',
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              }}
              // Tidak perlu JS untuk hover warna
            >
              <span className="flex items-center">
                {/* Ikon line graph */}
                <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === '/' ? '#fff' : '#9FA6BC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 17 9 11 13 15 21 7" />
                  <circle cx="3" cy="17" r="1.5" fill={pathname === '/' ? '#fff' : '#9FA6BC'} />
                  <circle cx="9" cy="11" r="1.5" fill={pathname === '/' ? '#fff' : '#9FA6BC'} />
                  <circle cx="13" cy="15" r="1.5" fill={pathname === '/' ? '#fff' : '#9FA6BC'} />
                  <circle cx="21" cy="7" r="1.5" fill={pathname === '/' ? '#fff' : '#9FA6BC'} />
                </svg>
                <span>Dashboards</span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/device" className={`flex items-center hover:bg-[#23263a] transition-all duration-200 ${pathname === '/device' ? 'rounded-full' : 'rounded-md hover:rounded-full'}`}
              style={pathname === '/device' ? {
                background: '#2C3242',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              } : {
                color: '#9FA6BC',
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              }}>
              {/* Ikon laptop outline */}
              <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === '/device' ? '#fff' : '#9FA6BC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="12" rx="2" />
                <path d="M2 17h20" />
              </svg>
              <span>Device</span>
            </Link>
          </li>
          <li>
            <Link href="/data" className={`flex items-center hover:bg-[#23263a] transition-all duration-200 ${pathname === '/data' ? 'rounded-full' : 'rounded-md hover:rounded-full'}`}
              style={pathname === '/data' ? {
                background: '#2C3242',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              } : {
                color: '#9FA6BC',
                fontSize: '12.8px',
                fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                padding: '5.6px 8px 5.6px 16px'
              }}>
              {/* Ikon database outline */}
              <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pathname === '/data' ? '#fff' : '#9FA6BC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="7" rx="9" ry="4" />
                <path d="M3 7v6c0 2.21 4.03 4 9 4s9-1.79 9-4V7" />
                <path d="M3 13v4c0 2.21 4.03 4 9 4s9-1.79 9-4v-4" />
              </svg>
              <span>Data</span>
            </Link>
          </li>
        </ul>
      </nav>
      {/* Collapsed View Button */}
      <div className="mt-auto p-4 border-t border-[#3B4253]">
        <button className="flex items-center text-[#B4B7BD] hover:text-white w-full">
          <svg className="mr-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B4B7BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M2 17h20" /></svg>
          <span>Collapsed View</span>
        </button>
      </div>
    </aside>
  );
} 
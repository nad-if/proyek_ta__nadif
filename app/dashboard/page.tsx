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
import { useState, useRef, useEffect, useMemo } from 'react';
import { DEVICE_IDS } from '../data/deviceIds';

type DeviceName = keyof typeof DEVICE_IDS;

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

// Threshold power untuk status transmit/receive (PTT on/off)
const PTT_THRESHOLD = -40; // diubah ke -40 dB
// Kalibrasi perbedaan gain antara channel reflected (SDR2) terhadap forward (SDR1) dalam dB
const REFLECTED_CAL_DB = 0; // sesuaikan jika diperlukan

export default function DashboardPage() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceName>('SDR 1');
  const [chartData, setChartData] = useState<{ timestamp: string, power: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pttData, setPttData] = useState<{ timestamp: string, ptt: number }[]>([]);
  const [swrData, setSwrData] = useState<{ frequency: number, swr: number, swrRaw: number }[]>([]);
  const powerScrollRef = useRef<HTMLDivElement>(null);
  const pttScrollRef = useRef<HTMLDivElement>(null);
  const swrScrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const isSdr1 = selectedDevice === 'SDR 1';

  const swrFreqMinMax = useMemo(() => {
    if (!swrData || swrData.length === 0) return null as null | { min: number; max: number };
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const d of swrData) {
      if (d.frequency < min) min = d.frequency;
      if (d.frequency > max) max = d.frequency;
    }
    return { min, max };
  }, [swrData]);

  // Lebar chart dinamis untuk memungkinkan horizontal scroll
  const swrChartWidthPx = useMemo(() => {
    const n = swrData?.length ?? 0;
    // 12 px per titik, minimal 800 px agar tetap terbaca
    return Math.max(800, n * 12);
  }, [swrData]);

  const timeChartWidthPx = useMemo(() => {
    const n = chartData?.length ?? 0;
    return Math.max(800, n * 12);
  }, [chartData]);

  const pttChartWidthPx = useMemo(() => {
    const n = pttData?.length ?? 0;
    return Math.max(800, n * 12);
  }, [pttData]);

  // Tidak ada sinkronisasi antar grafik; masing-masing punya scrollbar sendiri

  useEffect(() => {
    setLoading(true);
    setError(null);
    hasLoadedRef.current = false; // Reset saat ganti device
    let timer: any;
    const fileSelectedBase = selectedDevice === 'SDR 1' ? '/data.json' : '/data2.json';

    const doFetch = () => {
      const ts = Date.now();
      const selUrl = `${fileSelectedBase}?t=${ts}`;
      const fwdUrl = `/data.json?t=${ts}`;
      const refUrl = `/data2.json?t=${ts}`;
      return Promise.all([
        fetch(selUrl, { cache: 'no-store' }), // untuk grafik power & PTT
        fetch(fwdUrl, { cache: 'no-store' }), // diasumsikan forward power (SDR 1)
        fetch(refUrl, { cache: 'no-store' }) // diasumsikan reflected power (SDR 2)
    ])
      .then(async ([resSel, resFwd, resRef]) => {
        if (!resSel.ok) {
          console.error('Response status:', resSel.status);
          const text = await resSel.text();
          console.error('Response text:', text);
          throw new Error('Gagal fetch data utama');
        }
        
        // Helper untuk parse JSON dengan error handling dan retry
        const safeJsonParse = async (response: Response, name: string): Promise<any[]> => {
          try {
            const text = await response.text();
            if (!text || text.trim() === '') {
              console.warn(`${name} is empty, returning empty array`);
              return [];
            }
            
            // Coba parse dengan retry jika error
            let parsed: any = null;
            let lastError: Error | null = null;
            
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                parsed = JSON.parse(text);
                break;
              } catch (e: any) {
                lastError = e;
                // Jika error di tengah file, coba potong sampai posisi error
                if (e.message && e.message.includes('position')) {
                  const match = e.message.match(/position (\d+)/);
                  if (match) {
                    const pos = parseInt(match[1]);
                    // Potong sampai posisi error dan coba parse lagi
                    const truncated = text.substring(0, pos);
                    try {
                      parsed = JSON.parse(truncated);
                      console.warn(`${name} truncated at position ${pos}, using partial data`);
                      break;
                    } catch {
                      // Jika masih error, coba lagi dengan delay kecil
                      if (attempt < 2) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                        continue;
                      }
                    }
                  }
                }
                if (attempt === 2) {
                  throw e;
                }
              }
            }
            
            if (parsed === null) {
              throw lastError || new Error('Failed to parse JSON');
            }
            
             return Array.isArray(parsed) ? parsed : [];
           } catch (e: any) {
             // Hanya log warning untuk error yang sudah di-handle, bukan error fatal
             if (e.message && e.message.includes('position')) {
               // JSON corrupt - sudah di-handle dengan truncate, cukup warn
               console.warn(`JSON parsing issue for ${name} (handled gracefully)`);
             } else {
               // Error lain - log untuk debugging
               console.error(`Error parsing ${name}:`, e.message || e);
             }
             // Return empty array instead of crashing
             return [];
           }
        };

        if (!resFwd.ok || !resRef.ok) {
          // Jika salah satu gagal, tetap render chart utama, tapi SWR kosong
          const jsonSel = await safeJsonParse(resSel, 'selected');
          // Hanya update jika ada data baru yang valid, jangan reset ke empty
          if (jsonSel.length > 0) {
            const mappedSel = jsonSel.map((item: any) => ({
              timestamp: item.timestamp?.split(' ')[1] || '',
              power: item.power_db || 0
            }));
            setChartData(mappedSel);
            const mappedPTT = mappedSel.map((item: any) => ({
              timestamp: item.timestamp,
              ptt: item.power > PTT_THRESHOLD ? 1 : 0
            }));
            setPttData(mappedPTT);
          }
          // Jangan reset swrData, biarkan data terakhir tetap ada
          return;
        }

        const [jsonSel, jsonFwd, jsonRef] = await Promise.all([
          safeJsonParse(resSel, 'selected'),
          safeJsonParse(resFwd, 'forward'),
          safeJsonParse(resRef, 'reflected')
        ]);

        // Mapping untuk grafik power & PTT (berdasarkan device yang dipilih)
        // Hanya update jika ada data baru yang valid, jangan reset ke empty
        if (jsonSel.length > 0) {
          const mappedSel = jsonSel
            .filter((item: any) => item && item.timestamp && typeof item.power_db === 'number')
            .map((item: any) => ({
              timestamp: item.timestamp.split(' ')[1] || item.timestamp,
              power: item.power_db
            }));
          
          // Hanya update jika ada data valid
          if (mappedSel.length > 0) {
            setChartData(mappedSel);
            const mappedPTT = mappedSel.map((item: any) => ({
              timestamp: item.timestamp,
              ptt: item.power > PTT_THRESHOLD ? 1 : 0
            }));
            setPttData(mappedPTT);
          }
        }

        // Pilih sampel terbaru per frekuensi untuk forward (SDR1) dan reflected (SDR2)
        const forwardLatest = new Map<number, { powerDb: number, timestamp: string }>();
        for (const it of jsonFwd) {
          if (typeof it.frequency !== 'number' || typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
          const prev = forwardLatest.get(it.frequency);
          if (!prev || it.timestamp > prev.timestamp) {
            forwardLatest.set(it.frequency, { powerDb: it.power_db, timestamp: it.timestamp });
          }
        }
        const reflectedLatest = new Map<number, { powerDb: number, timestamp: string }>();
        for (const it of jsonRef) {
          if (typeof it.frequency !== 'number' || typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
          const prev = reflectedLatest.get(it.frequency);
          if (!prev || it.timestamp > prev.timestamp) {
            reflectedLatest.set(it.frequency, { powerDb: it.power_db, timestamp: it.timestamp });
          }
        }

        // Hitung satu nilai SWR per frekuensi berdasarkan sampel terbaru
        // Hanya update jika ada data valid, jangan reset ke empty
        if (jsonFwd.length > 0 && jsonRef.length > 0) {
          const swrList: { frequency: number, swr: number, swrRaw: number }[] = [];
          for (const [freq, fwd] of forwardLatest.entries()) {
            const ref = reflectedLatest.get(freq);
            if (!ref) continue;
            const pfDb = fwd.powerDb;
            const prDb = ref.powerDb + REFLECTED_CAL_DB;
            const ratioLin = Math.pow(10, (prDb - pfDb) / 10);
            const gammaMag = Math.sqrt(Math.max(0, ratioLin));
            const gammaClamped = Math.min(gammaMag, 0.9999);
            const swrRaw = (1 + gammaClamped) / (1 - gammaClamped);
            const swr = Math.max(1, Math.min(10, swrRaw));
            if (Number.isFinite(swrRaw)) {
              swrList.push({ frequency: freq, swr, swrRaw });
            }
          }
          // Urutkan berdasarkan frequency
          swrList.sort((a, b) => a.frequency - b.frequency);
          // Hanya update jika ada data valid
          if (swrList.length > 0) {
            setSwrData(swrList);
          }
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        // Jangan set error yang akan reset UI, cukup log saja
        // setError(err.message);
        // Data terakhir tetap ditampilkan, tidak di-reset
      })
      .finally(() => {
        // Hanya set loading false setelah pertama kali fetch berhasil
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setLoading(false);
        }
      });
    }

    // fetch awal
    doFetch();
    // polling tiap 2 detik untuk update yang lebih responsif
    timer = setInterval(doFetch, 2000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedDevice]);

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
              {/* <span className="text-white font-medium text-sm">Nadif Aulia Putra</span> */}
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
            <div className="space-y-6">
              {/* Page Title */}
              <div>
                <h1 className="mb-2 text-[27px] font-bold text-[#EFF2F6]" style={{ fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
                  Monitoring Dashboard
                </h1>
                {/* Dropdown Select Device */}
                <DeviceDropdown selected={selectedDevice} onSelect={(val) => setSelectedDevice(val)} />
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              </div>
              {/* Grafik SDR sesuai device yang dipilih */}
              {loading ? (
                <div className="text-white">Loading...</div>
              ) : error ? (
                <div className="text-red-500">Error: {error}</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedDevice}</h3>
                        <p className="text-[#B4B7BD] text-sm">Power (dB)</p>
                      </div>
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                          <span className="text-white text-sm">Power (dB)</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[250px] overflow-x-auto" ref={powerScrollRef}>
                      <div className="min-w-full" style={{ width: `${timeChartWidthPx}px`, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                  {/* Row: PTT dan SWR side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grafik PTT (Transmit/Receive) */}
                    <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Status Transmit (PTT)</h3>
                          <p className="text-[#B4B7BD] text-sm">1 = PTT ON (Transmit), 0 = PTT OFF (Receive)</p>
                        </div>
                      </div>
                      <div className="h-[120px] flex">
                        <div className="w-20 pr-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={pttData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                              <YAxis
                                stroke="#B4B7BD"
                                axisLine={false}
                                tickLine={false}
                                domain={[-0.1, 1.1]}
                                ticks={[0, 1]}
                                tick={(props) => {
                                  const { x, y, payload } = props as any;
                                  const isOn = payload?.value === 1;
                                  const dy = isOn ? -1 : -3; // naikkan sedikit, OFF lebih banyak
                                  return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text x={0} y={0} dy={dy} textAnchor="end" dominantBaseline="middle" fill="#B4B7BD" fontSize={12}>
                                        {isOn ? 'PTT ON' : 'PTT OFF'}
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <XAxis dataKey="timestamp" tick={false} axisLine={false} height={40} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 overflow-x-auto" ref={pttScrollRef}>
                          <div className="min-w-full" style={{ width: `${pttChartWidthPx}px`, height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={pttData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} horizontal={false} />
                                <XAxis 
                                  dataKey="timestamp" 
                                  stroke="#B4B7BD" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  style={{ fontSize: '10px' }}
                                />
                                <YAxis hide domain={[-0.1, 1.1]} ticks={[0, 1]} />
                                <ReferenceLine y={0} stroke="#3A3B64" strokeDasharray="3 3" />
                                <ReferenceLine y={1} stroke="#3A3B64" strokeDasharray="3 3" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0e111a',
                                    border: '1px solid #3B4253',
                                    borderRadius: '4px',
                                  }}
                                  formatter={(value) => [value === 1 ? 'PTT ON' : 'PTT OFF', 'Status']}
                                />
                                <Line
                                  type="stepAfter"
                                  dataKey="ptt"
                                  stroke="#00E676"
                                  strokeWidth={3}
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Grafik SWR */}
                    <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">SWR</h3>
                          <p className="text-[#B4B7BD] text-sm">vs Frequency (SDR1=Forward, SDR2=Reflected) | Y: 1–10 </p>
                        </div>
                      </div>
                      {swrData && swrData.length > 0 ? (
                        <div className="h-[120px] flex">
                          <div className="w-20 pr-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={swrData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                <YAxis 
                                  stroke="#B4B7BD" 
                                  axisLine={false} 
                                  tickLine={false}
                                  domain={isSdr1 ? [1, 12] : [1, 10]}
                                  ticks={isSdr1 ? [4, 8, 12] : [1, 5, 10]}
                                  tick={(props) => {
                                    const { x, y, payload } = props as any;
                                    return (
                                      <g transform={`translate(${x},${y})`}>
                                        <text x={0} y={0} dy={4} textAnchor="end" fill="#B4B7BD" fontSize={10}>
                                          {payload?.value}
                                        </text>
                                      </g>
                                    );
                                  }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-1 overflow-x-auto" ref={swrScrollRef}>
                            <div style={{ width: `${swrChartWidthPx}px`, height: '100%' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={swrData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} horizontal={false} />
                                  <XAxis 
                                    dataKey="frequency"
                                    type="number"
                                    domain={swrFreqMinMax ? [swrFreqMinMax.min, swrFreqMinMax.max] : ['auto', 'auto']}
                                    stroke="#B4B7BD" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    style={{ fontSize: '10px' }}
                                    tickFormatter={(val: number) => `${(val / 1e6).toFixed(3)} MHz`}
                                  />
                                  <YAxis hide domain={isSdr1 ? [1, 12] : [1, 10]} ticks={isSdr1 ? [4, 8, 12] : [1, 5, 10]} />
                                  {isSdr1 ? (
                                    <>
                                      <ReferenceLine y={4} stroke="#3A3B64" strokeDasharray="3 3" />
                                      <ReferenceLine y={8} stroke="#3A3B64" strokeDasharray="3 3" />
                                      <ReferenceLine y={12} stroke="#3A3B64" strokeDasharray="3 3" />
                                    </>
                                  ) : (
                                    <>
                                      <ReferenceLine y={1} stroke="#3A3B64" strokeDasharray="3 3" />
                                      <ReferenceLine y={5} stroke="#3A3B64" strokeDasharray="3 3" />
                                      <ReferenceLine y={10} stroke="#3A3B64" strokeDasharray="3 3" />
                                    </>
                                  )}
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#0e111a',
                                      border: '1px solid #3B4253',
                                      borderRadius: '4px',
                                    }}
                                    formatter={(value, _name, entry: any) => [
                                      entry?.payload?.swrRaw > 10 ? '> 10' : (value as number).toFixed(2),
                                      'SWR'
                                    ]}
                                    labelFormatter={(label) => `${(Number(label) / 1e6).toFixed(3)} MHz`}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="swr"
                                    stroke="#29B6F6"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[120px] flex items-center justify-center text-[#B4B7BD] text-sm">
                          Data SWR belum dapat dihitung dari sumber saat ini
                        </div>
                      )}
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

function DeviceDropdown({ selected, onSelect }: { selected: DeviceName, onSelect: (val: DeviceName) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const devices: DeviceName[] = ['SDR 1', 'SDR 2'];

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
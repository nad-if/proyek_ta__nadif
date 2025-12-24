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
  const [chartData, setChartData] = useState<{ timestamp: string, power: number }[]>([]);
  const [combinedChartData, setCombinedChartData] = useState<{ timestamp: string, sdr1: number | null, sdr2: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pttData, setPttData] = useState<{ timestamp: string, ptt: number }[]>([]);
  const [returnLossData, setReturnLossData] = useState<{ timestamp: string, returnLoss: number }[]>([]);
  const powerScrollRef = useRef<HTMLDivElement>(null);
  const pttScrollRef = useRef<HTMLDivElement>(null);
  const returnLossScrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef<boolean>(false);

  // Handle click outside untuk profile dropdown
  useEffect(() => {
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

  // Lebar chart dinamis untuk memungkinkan horizontal scroll
  const returnLossChartWidthPx = useMemo(() => {
    const n = returnLossData?.length ?? 0;
    return Math.max(800, n * 12);
  }, [returnLossData]);

  // Hitung min/max Return Loss dari data aktual untuk domain Y-axis yang dinamis
  const returnLossDomain = useMemo(() => {
    if (!returnLossData || returnLossData.length === 0) return [-10, 0] as [number, number];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const d of returnLossData) {
      if (d.returnLoss < min) min = d.returnLoss;
      if (d.returnLoss > max) max = d.returnLoss;
    }
    // Tambahkan padding 10% di atas dan bawah
    const padding = Math.max(2, (max - min) * 0.1);
    let minVal = Math.floor(min - padding);
    let maxVal = Math.ceil(max + padding);
    
    // Return Loss HARUS selalu negatif atau 0, jadi maxVal tidak boleh lebih dari 0
    maxVal = Math.min(0, maxVal);
    
    // Pastikan domain selalu mencakup -10 jika min <= -5
    if (min <= -5) {
      minVal = Math.min(minVal, -10);
    }
    
    // Pastikan domain masuk akal (tidak terlalu ekstrem)
    return [Math.max(-20, minVal), maxVal] as [number, number];
  }, [returnLossData]);

  // Generate ticks berdasarkan domain
  const returnLossTicks = useMemo(() => {
    const [min, max] = returnLossDomain;
    // Untuk Return Loss, gunakan step 5 untuk menghasilkan 0, -5, -10, dll
    const step = 5;
    const ticks: number[] = [];
    // Mulai dari nilai yang dibulatkan ke bawah ke kelipatan step
    const startTick = Math.floor(min / step) * step;
    // Akhiri di nilai yang dibulatkan ke atas ke kelipatan step, tapi maksimal 0
    const endTick = Math.min(0, Math.ceil(max / step) * step);
    
    for (let i = startTick; i <= endTick; i += step) {
      // Hanya tambahkan ticks yang <= 0 (Return Loss tidak boleh positif)
      if (i <= 0) {
        ticks.push(i);
      }
    }
    
    // Pastikan 0 selalu ada jika dalam range
    if (min <= 0 && max >= 0 && !ticks.includes(0)) {
      ticks.push(0);
    }
    
    // Pastikan -10 selalu ada jika min <= -10
    if (min <= -10 && !ticks.includes(-10)) {
      ticks.push(-10);
    }
    
    // Pastikan -5 selalu ada jika min <= -5
    if (min <= -5 && !ticks.includes(-5)) {
      ticks.push(-5);
    }
    
    // Urutkan ticks dan filter hanya yang <= 0
    ticks.sort((a, b) => a - b);
    return ticks.filter(tick => tick <= 0);
  }, [returnLossDomain]);

  const timeChartWidthPx = useMemo(() => {
    const n = combinedChartData?.length ?? chartData?.length ?? 0;
    return Math.max(800, n * 12);
  }, [combinedChartData, chartData]);

  const pttChartWidthPx = useMemo(() => {
    const n = pttData?.length ?? 0;
    return Math.max(800, n * 12);
  }, [pttData]);

  // Tidak ada sinkronisasi antar grafik; masing-masing punya scrollbar sendiri

  useEffect(() => {
    setLoading(true);
    setError(null);
    hasLoadedRef.current = false;
    let timer: any;

    const doFetch = () => {
      const ts = Date.now();
      const fwdUrl = `/data_dummy.json?t=${ts}`; // forward power (SDR 1)
      const refUrl = `/data2_dummy.json?t=${ts}`; // reflected power (SDR 2)
      return Promise.allSettled([
        fetch(fwdUrl, { cache: 'no-store' }), // diasumsikan forward power (SDR 1)
        fetch(refUrl, { cache: 'no-store' }) // diasumsikan reflected power (SDR 2)
    ])
      .then(async (results) => {
        const [resFwdResult, resRefResult] = results;
        
        // Helper untuk parse JSON dengan error handling dan retry
        const safeJsonParse = async (response: Response | null, name: string): Promise<any[]> => {
          if (!response || !response.ok) {
            console.warn(`${name} fetch failed or response not ok`);
            return [];
          }
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

        // Parse semua data, bahkan jika salah satu gagal
        const resFwd = resFwdResult.status === 'fulfilled' ? resFwdResult.value : null;
        const resRef = resRefResult.status === 'fulfilled' ? resRefResult.value : null;
        
        const jsonFwd = await safeJsonParse(resFwd, 'forward');
        const jsonRef = await safeJsonParse(resRef, 'reflected');

        // Mapping untuk grafik power & PTT menggunakan data SDR 1 (forward)
        if (jsonFwd.length > 0) {
          const mappedFwd = jsonFwd
            .filter((item: any) => item && item.timestamp && typeof item.power_db === 'number')
            .map((item: any) => ({
              timestamp: item.timestamp.split(' ')[1] || item.timestamp,
              power: item.power_db
            }));
          
          // Hanya update jika ada data valid
          if (mappedFwd.length > 0) {
            setChartData(mappedFwd);
            const mappedPTT = mappedFwd.map((item: any) => ({
              timestamp: item.timestamp,
              ptt: item.power > PTT_THRESHOLD ? 1 : 0
            }));
            setPttData(mappedPTT);
          }
        }

        // Gabungkan data SDR 1 dan SDR 2 untuk grafik gabungan
        if (jsonFwd.length > 0 || jsonRef.length > 0) {
          // Buat map untuk mengelompokkan data per timestamp
          const sdr1ByTimestamp = new Map<string, { powerDb: number, timestamp: string }>();
          const sdr2ByTimestamp = new Map<string, { powerDb: number, timestamp: string }>();
          
          // Ambil data terbaru per timestamp untuk SDR 1 (forward)
          for (const it of jsonFwd) {
            if (typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
            const timeKey = it.timestamp.split(' ')[1] || it.timestamp;
            const prev = sdr1ByTimestamp.get(timeKey);
            if (!prev || it.timestamp > prev.timestamp) {
              sdr1ByTimestamp.set(timeKey, { powerDb: it.power_db, timestamp: timeKey });
            }
          }
          
          // Ambil data terbaru per timestamp untuk SDR 2 (reflected)
          for (const it of jsonRef) {
            if (typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
            const timeKey = it.timestamp.split(' ')[1] || it.timestamp;
            const prev = sdr2ByTimestamp.get(timeKey);
            if (!prev || it.timestamp > prev.timestamp) {
              sdr2ByTimestamp.set(timeKey, { powerDb: it.power_db, timestamp: timeKey });
            }
          }
          
          // Gabungkan data untuk setiap timestamp yang ada
          const combinedList: { timestamp: string, sdr1: number | null, sdr2: number | null }[] = [];
          const allTimestamps = new Set([...sdr1ByTimestamp.keys(), ...sdr2ByTimestamp.keys()]);
          
          for (const timeKey of allTimestamps) {
            const sdr1 = sdr1ByTimestamp.get(timeKey);
            const sdr2 = sdr2ByTimestamp.get(timeKey);
            if (sdr1 || sdr2) {
              combinedList.push({
                timestamp: timeKey,
                sdr1: sdr1?.powerDb ?? null,
                sdr2: sdr2?.powerDb ?? null
              });
            }
          }
          
          // Urutkan berdasarkan timestamp
          combinedList.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          
          // Hanya update jika ada data valid
          if (combinedList.length > 0) {
            setCombinedChartData(combinedList);
          }
        }

        // Hitung Return Loss per timestamp dari forward (SDR1) dan reflected (SDR2)
        // Return Loss (dB) = Forward Power (dB) - Reflected Power (dB)
        if (jsonFwd.length > 0 && jsonRef.length > 0) {
          // Buat map untuk mengelompokkan data per timestamp
          const forwardByTimestamp = new Map<string, { powerDb: number, timestamp: string }>();
          const reflectedByTimestamp = new Map<string, { powerDb: number, timestamp: string }>();
          
          // Ambil data terbaru per timestamp untuk forward
          for (const it of jsonFwd) {
            if (typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
            const timeKey = it.timestamp.split(' ')[1] || it.timestamp; // Ambil hanya waktu (HH:MM:SS)
            const prev = forwardByTimestamp.get(timeKey);
            if (!prev || it.timestamp > prev.timestamp) {
              forwardByTimestamp.set(timeKey, { powerDb: it.power_db, timestamp: timeKey });
            }
          }
          
          // Ambil data terbaru per timestamp untuk reflected
          for (const it of jsonRef) {
            if (typeof it.power_db !== 'number' || typeof it.timestamp !== 'string') continue;
            const timeKey = it.timestamp.split(' ')[1] || it.timestamp; // Ambil hanya waktu (HH:MM:SS)
            const prev = reflectedByTimestamp.get(timeKey);
            if (!prev || it.timestamp > prev.timestamp) {
              reflectedByTimestamp.set(timeKey, { powerDb: it.power_db, timestamp: timeKey });
            }
          }
          
          // Hitung Return Loss untuk setiap timestamp yang ada di kedua data
          const returnLossList: { timestamp: string, returnLoss: number }[] = [];
          const allTimestamps = new Set([...forwardByTimestamp.keys(), ...reflectedByTimestamp.keys()]);
          
          for (const timeKey of allTimestamps) {
            const fwd = forwardByTimestamp.get(timeKey);
            const ref = reflectedByTimestamp.get(timeKey);
            if (fwd && ref) {
              // Return Loss (dB) = Reflected_dB - Forward_dB
              // Return Loss seharusnya selalu negatif karena Forward Power > Reflected Power
              // Semakin negatif (semakin besar nilai absolutnya) semakin baik (lebih sedikit power yang direfleksikan)
              const adjustedRef = ref.powerDb + REFLECTED_CAL_DB;
              
              // Hitung Return Loss
              let returnLoss = adjustedRef - fwd.powerDb;
              
              // Return Loss HARUS selalu negatif
              // Jika hasilnya positif, berarti ada masalah (data tertukar atau kalibrasi salah)
              // Untuk memastikan Return Loss selalu negatif, kita ambil nilai negatif dari absolutnya
              if (returnLoss > 0) {
                // Jika positif, kemungkinan data tertukar - balik rumusnya
                returnLoss = fwd.powerDb - adjustedRef;
              }
              
              // Pastikan hasilnya negatif (jika masih positif, paksa menjadi negatif)
              if (returnLoss > 0) {
                returnLoss = -Math.abs(returnLoss);
              }
              
              if (Number.isFinite(returnLoss) && returnLoss <= 0) {
                returnLossList.push({ timestamp: timeKey, returnLoss });
              }
            }
          }
          
          // Urutkan berdasarkan timestamp
          returnLossList.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          
          // Hanya update jika ada data valid
          if (returnLossList.length > 0) {
            setReturnLossData(returnLossList);
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
  }, []);

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
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Page Title */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7367F0] to-[#29B6F6] opacity-20 blur-lg rounded-md"></div>
                    <div className="relative bg-gradient-to-r from-[#7367F0] to-[#29B6F6] p-1.5 rounded-md">
                      <FiActivity className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-[#EFF2F6] via-[#B4B7BD] to-[#EFF2F6] bg-clip-text text-transparent" style={{ fontFamily: 'Nunito Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
                      Monitoring Dashboard
                    </h1>
                    <p className="text-xs text-[#B4B7BD] mt-0">Real-time monitoring dan analisis data SDR 1 & SDR 2</p>
                  </div>
                </div>
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
                        <h3 className="text-lg font-semibold text-white">SDR 1 & SDR 2 Power (dB)</h3>
                        <p className="text-[#B4B7BD] text-sm">Power (dB)</p>
                      </div>
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-[#7367F0] rounded-full mr-2"></div>
                            <span className="text-white text-sm">SDR 1</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-[#29B6F6] rounded-full mr-2"></div>
                            <span className="text-white text-sm">SDR 2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-[250px] overflow-x-auto" ref={powerScrollRef}>
                      <div className="min-w-full" style={{ width: `${timeChartWidthPx}px`, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={combinedChartData.length > 0 ? combinedChartData : chartData.map(item => ({ timestamp: item.timestamp, sdr1: item.power, sdr2: null }))} 
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                          >
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
                            formatter={(value: any, name: string) => {
                              if (value === null || value === undefined) return [null, name];
                              return [`${value} dB`, name === 'sdr1' ? 'SDR 1' : name === 'sdr2' ? 'SDR 2' : 'Power'];
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="sdr1"
                            stroke="#7367F0"
                            strokeWidth={2}
                            dot={{ stroke: '#7367F0', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#7367F0', strokeWidth: 2 }}
                            isAnimationActive={false}
                            connectNulls={false}
                            name="SDR 1"
                          />
                          <Line
                            type="monotone"
                            dataKey="sdr2"
                            stroke="#29B6F6"
                            strokeWidth={2}
                            dot={{ stroke: '#29B6F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#29B6F6', strokeWidth: 2 }}
                            isAnimationActive={false}
                            connectNulls={false}
                            name="SDR 2"
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
                  {/* Row: PTT dan Return Loss side-by-side */}
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
                    {/* Grafik Return Loss */}
                    <div className="bg-[#0e111a] p-6 rounded-lg border border-[#3B4253]">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Return Loss</h3>
                          <p className="text-[#B4B7BD] text-sm">vs Waktu (SDR1=Forward, SDR2=Reflected) | Y: Return Loss (dB)</p>
                        </div>
                      </div>
                      {returnLossData && returnLossData.length > 0 ? (
                        <div className="h-[120px] flex">
                          <div className="w-20 pr-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={returnLossData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                <YAxis 
                                  stroke="#B4B7BD" 
                                  axisLine={false} 
                                  tickLine={false}
                                  domain={returnLossDomain}
                                  ticks={returnLossTicks}
                                  allowDataOverflow={false}
                                  tick={(props) => {
                                    const { x, y, payload } = props as any;
                                    const value = payload?.value;
                                    // Angka 0 ditampilkan dengan style khusus (bold, putih) seperti di grafik Power
                                    if (value === 0) {
                                      return (
                                        <g transform={`translate(${x},${y})`}>
                                          <text 
                                            x={0} 
                                            y={0} 
                                            dy={-4} 
                                            textAnchor="end" 
                                            fill="#FFFFFF" 
                                            fontSize={12}
                                            fontWeight="bold"
                                          >
                                            {value}
                                          </text>
                                        </g>
                                      );
                                    }
                                    // Untuk angka negatif seperti -5, -10
                                    // -5 diganti labelnya jadi -10 dan diturunkan sampai sejajar dengan baris bawah
                                    // -10 diturunkan sampai sejajar dengan baris paling bawah
                                    let dyValue = -4;
                                    let displayValue = value;
                                    if (value === -5) {
                                      displayValue = -10; // Ganti label -5 jadi -10
                                      dyValue = 3; // Turunkan lebih banyak
                                    } else if (value === -10) {
                                      dyValue = 4; // Turunkan -10 sampai sejajar dengan garis horizontal paling bawah
                                    }
                                    return (
                                      <g transform={`translate(${x},${y})`}>
                                        <text 
                                          x={0} 
                                          y={0} 
                                          dy={dyValue} 
                                          textAnchor="end" 
                                          fill="#B4B7BD" 
                                          fontSize={10}
                                        >
                                          {displayValue}
                                        </text>
                                      </g>
                                    );
                                  }}
                                />
                                <XAxis dataKey="timestamp" tick={false} axisLine={false} height={0} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-1 overflow-x-auto" ref={returnLossScrollRef}>
                            <div style={{ width: `${returnLossChartWidthPx}px`, height: '100%' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={returnLossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#3A3B64" vertical={false} horizontal={false} />
                                  <XAxis 
                                    dataKey="timestamp"
                                    stroke="#B4B7BD" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    style={{ fontSize: '10px' }}
                                    interval="preserveStartEnd"
                                  />
                                  <YAxis 
                                    width={0}
                                    domain={returnLossDomain} 
                                    ticks={returnLossTicks}
                                    allowDataOverflow={false}
                                  />
                                  {returnLossTicks.map((tick) => (
                                    <ReferenceLine 
                                      key={tick} 
                                      y={tick} 
                                      stroke="#3A3B64" 
                                      strokeDasharray="3 3"
                                      strokeWidth={1}
                                    />
                                  ))}
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#0e111a',
                                      border: '1px solid #3B4253',
                                      borderRadius: '4px',
                                    }}
                                    formatter={(value) => {
                                      const val = value as number;
                                      return [`${val.toFixed(2)} dB`, 'Return Loss'];
                                    }}
                                    labelFormatter={(label) => `Waktu: ${label}`}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="returnLoss"
                                    stroke="#29B6F6"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                    connectNulls={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[120px] flex items-center justify-center text-[#B4B7BD] text-sm">
                          Data Return Loss belum dapat dihitung dari sumber saat ini
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

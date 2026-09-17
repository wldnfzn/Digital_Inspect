import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Date Filters
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report Detail Modal States
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let url = '/dashboard/stats?';
        if (startDate && endDate) {
          url += \`startDate=\${startDate}&endDate=\${endDate}\`;
        } else if (month) {
          url += \`month=\${month}\`;
        }
        const response = await api.get(url);
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [month, startDate, endDate]);

  const openDetail = async (id: string, type: string) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(\`/inspections/\${type.toLowerCase()}/\${id}\`);
      if (res.data?.data) {
        setSelectedReport(res.data.data);
        setSelectedReportType(type);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load report detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!stats && loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <p className="text-on-surface-variant font-body-md animate-pulse">Memuat dashboard...</p>
      </div>
    );
  }

  // Formatting for Recharts
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return \`\${d.getDate()} \${d.toLocaleString('id-ID', { month: 'short' })}\`;
  };

  const donutData = [
    { name: 'Bagus', value: stats?.health_status?.good || 0, color: '#16a34a' },
    { name: 'Perhatian', value: stats?.health_status?.attention || 0, color: '#f59e0b' },
    { name: 'Kritis', value: stats?.health_status?.critical || 0, color: '#dc2626' }
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="p-gutter-lg space-y-gutter-lg">
        {/* 1. Header & Date Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md print:hidden">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Dashboard Utama</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Ringkasan performa dan kesehatan aset perusahaan.</p>
          </div>
          
          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Bulan:</label>
              <input 
                type="month" 
                value={month} 
                onChange={e => { setMonth(e.target.value); setStartDate(''); setEndDate(''); }} 
                className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer border-none p-0 focus:ring-0"
              />
            </div>
            
            <div className="hidden sm:block w-px h-5 bg-surface-container"></div>
            
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Range:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => { setStartDate(e.target.value); setMonth(''); }} 
                className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer border-none p-0 focus:ring-0"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant">sd</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => { setEndDate(e.target.value); setMonth(''); }} 
                className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer border-none p-0 focus:ring-0"
              />
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2 rounded-lg shadow-sm transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 2. 5 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Total Forklift</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">forklift</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-display text-display font-bold text-on-surface tracking-tight">{stats?.total_forklifts || 0}</span>
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-space-xs py-0.5 rounded">Aktif</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Total Baterai</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">battery_charging_full</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-display text-display font-bold text-on-surface tracking-tight">{stats?.total_batteries || 0}</span>
              <span className="font-label-sm text-label-sm text-tertiary-container bg-tertiary-fixed px-space-xs py-0.5 rounded">Tersedia</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Total Karyawan</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-display text-display font-bold text-on-surface tracking-tight">{stats?.total_employees || 0}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">Sistem</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Inspeksi Selesai</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-display text-display font-bold text-emerald-600 tracking-tight">{stats?.completed_this_month || 0}</span>
              <span className="flex items-center text-emerald-600 font-label-sm text-label-sm gap-0.5 bg-emerald-50 px-space-xs py-0.5 rounded">
                Terdata
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Inspeksi Berjalan</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-display text-display font-bold text-amber-600 tracking-tight">{stats?.ongoing_tasks || 0}</span>
              <span className="flex items-center text-amber-600 font-label-sm text-label-sm gap-0.5 bg-amber-50 px-space-xs py-0.5 rounded animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Live
              </span>
            </div>
          </div>
        </div>

        {/* 3. Second Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Aktivitas Inspeksi Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-space-xs">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Aktivitas Inspeksi</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Volume per siklus operasional</p>
              </div>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Selesai</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Berjalan</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00288e" stopOpacity={0.14}/>
                      <stop offset="100%" stopColor="#00288e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eeff" />
                  <XAxis 
                    dataKey="date" 
                    xAxisId="selesai"
                    tickFormatter={formatShortDate}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#757684', fontSize: 11, fontWeight: 500 }} 
                    dy={10}
                  />
                  <XAxis 
                    dataKey="date" 
                    xAxisId="berjalan"
                    hide={true}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#757684', fontSize: 10, fontWeight: 500 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '12px' }}
                    labelFormatter={formatShortDate}
                  />
                  <Line 
                    data={stats?.activity_inspections || []} 
                    xAxisId="selesai"
                    type="monotone" 
                    dataKey="count" 
                    name="Selesai" 
                    stroke="#00288e" 
                    strokeWidth={3} 
                    dot={{ fill: '#ffffff', stroke: '#00288e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    data={stats?.active_tasks_trend || []} 
                    xAxisId="berjalan"
                    type="monotone" 
                    dataKey="count" 
                    name="Berjalan" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    strokeDasharray="4 2"
                    dot={{ fill: '#ffffff', stroke: '#f59e0b', strokeWidth: 2, r: 3.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Status Forklift Donut Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Health Status Forklift</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Distribusi kondisi fisik & komponen</p>
            </div>
            
            <div className="relative flex items-center justify-center my-space-sm h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">
                  {(stats?.health_status?.good || 0) + (stats?.health_status?.attention || 0) + (stats?.health_status?.critical || 0)}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Total Inspeksi</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
              <div className="bg-surface-container-low p-space-xs rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                  <span className="font-label-sm text-label-sm text-on-surface">Bagus</span>
                </div>
                <span className="font-label-md text-label-md font-bold text-[#16a34a] block mt-0.5">{stats?.health_status?.good || 0}</span>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                  <span className="font-label-sm text-label-sm text-on-surface">Perhatian</span>
                </div>
                <span className="font-label-md text-label-md font-bold text-[#f59e0b] block mt-0.5">{stats?.health_status?.attention || 0}</span>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                  <span className="font-label-sm text-label-sm text-on-surface">Kritis</span>
                </div>
                <span className="font-label-md text-label-md font-bold text-[#dc2626] block mt-0.5">{stats?.health_status?.critical || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Third Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Overall Index Avg Fleet Health */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Overall Index Avg Fleet Health</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Rerata skor kepatuhan & efisiensi mekanikal</p>
              </div>
              <div className="flex items-center gap-space-xs bg-primary-fixed text-on-primary-fixed px-space-sm py-1 rounded-full font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>Avg: {stats?.avg_fleet_health || 0}%</span>
              </div>
            </div>
            
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.avg_health_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0051d5" stopOpacity={0.18}/>
                      <stop offset="100%" stopColor="#0051d5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eeff" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatShortDate}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#757684', fontSize: 11, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => \`\${val}%\`}
                    tick={{ fill: '#757684', fontSize: 10, fontWeight: 500 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '12px' }}
                    labelFormatter={formatShortDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_score" 
                    name="Avg Health" 
                    stroke="#0051d5" 
                    strokeWidth={3} 
                    dot={{ fill: '#ffffff', stroke: '#0051d5', strokeWidth: 2.5, r: 4.5 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inspeksi Mekanik Terbanyak */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Inspeksi Mekanik Terbanyak</h2>
                <span className="material-symbols-outlined text-outline text-[20px]">military_tech</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Lead contributor periode ini</p>
            </div>
            <div className="space-y-space-sm divide-none flex-1 overflow-y-auto">
              {stats?.mechanic_inspections?.length > 0 ? (
                stats.mechanic_inspections.slice(0, 4).map((mech: any, idx: number) => {
                  const initials = mech.name.substring(0, 2).toUpperCase();
                  const colors = [
                    { bg: 'bg-primary', text: 'text-on-primary' },
                    { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
                    { bg: 'bg-surface-container-high', text: 'text-primary' },
                    { bg: 'bg-surface-variant', text: 'text-primary' }
                  ];
                  const color = colors[idx % colors.length];
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className={\`w-8 h-8 rounded-full \${color.bg} flex items-center justify-center \${color.text} font-label-md text-label-md font-bold\`}>
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate w-24">{mech.name}</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Mechanic</span>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md bg-surface-container-lowest text-primary px-space-sm py-1 rounded-full font-semibold shadow-xs">
                        {mech.count} Lap
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-on-surface-variant text-center py-4">Belum ada data</div>
              )}
            </div>
            <div className="pt-space-xs text-center mt-2">
              <span className="font-label-sm text-label-sm text-outline cursor-default">Total {stats?.mechanic_inspections?.length || 0} mekanik aktif</span>
            </div>
          </div>
        </div>

        {/* 5. Fourth Row Grid (Active Alerts & Recent Inspections) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          {/* Active Alerts */}
          <div className="bg-error-container/40 p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-7 h-7 rounded-lg bg-error flex items-center justify-center text-on-error">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-error-container font-bold">Active Alerts (Nilai 1)</h2>
                </div>
                <span className="bg-error text-on-error font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-semibold">
                  {stats?.critical_alerts?.length || 0} Perlu Tindakan
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-error-container/80 mb-space-md">
                Komponen dengan penilaian skor kritis.
              </p>
              
              <div className="space-y-space-sm max-h-[300px] overflow-y-auto pr-1">
                {stats?.critical_alerts?.length > 0 ? stats.critical_alerts.map((alert: any, idx: number) => (
                  <div key={idx} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">car_crash</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">{alert.asset_code}</span>
                          <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-semibold">Nilai 1</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{alert.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                      {alert.photo_url && (
                        <a href={alert.photo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-surface-container px-space-sm py-1.5 rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors print:hidden">
                          <span className="material-symbols-outlined text-[16px]">image</span>
                          <span>Foto</span>
                        </a>
                      )}
                      <button onClick={() => openDetail(alert.report_id, 'FORKLIFT')} className="bg-primary text-on-primary px-space-md py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors print:hidden">
                        View
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-on-surface-variant text-center py-4">Tidak ada critical alert.</div>
                )}
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-error-container font-label-sm text-label-sm">
              <span>Pemberitahuan otomatis terkirim.</span>
            </div>
          </div>

          {/* Recent Inspections Data Table */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Inspeksi Terakhir</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Log data telemetry audit terkini</p>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-space-sm max-h-[300px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider sticky top-0">
                      <th className="py-2.5 px-space-sm rounded-l-lg">Asset ID</th>
                      <th className="py-2.5 px-space-sm">Type</th>
                      <th className="py-2.5 px-space-sm">Date</th>
                      <th className="py-2.5 px-space-sm rounded-r-lg text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                    {stats?.recent_inspections?.length > 0 ? stats.recent_inspections.map((r: any, idx: number) => (
                      <tr key={idx} onClick={() => openDetail(r.id, r.asset_type)} className="hover:bg-surface-container-low/60 transition-colors cursor-pointer">
                        <td className="py-3 px-space-sm font-label-md text-label-md font-bold text-on-surface">{r.asset_code}</td>
                        <td className="py-3 px-space-sm">
                          <span className={\`font-label-sm text-label-sm px-space-xs py-0.5 rounded font-semibold \${r.asset_type === 'FORKLIFT' ? 'bg-surface-container text-primary' : 'bg-surface-container text-tertiary'}\`}>
                            {r.asset_type}
                          </span>
                        </td>
                        <td className="py-3 px-space-sm text-on-surface-variant">{formatShortDate(r.date)}</td>
                        <td className="py-3 px-space-sm text-right">
                          {r.asset_type === 'FORKLIFT' ? (
                            <span className={\`font-label-md text-label-md px-space-sm py-0.5 rounded-full font-bold \${
                              r.status === 'CRITICAL' ? 'bg-error-container text-on-error-container' :
                              r.status === 'ATTENTION' ? 'bg-amber-50 text-amber-600' :
                              'bg-emerald-50 text-emerald-600'
                            }\`}>
                              {r.score}%
                            </span>
                          ) : (
                            <span className="font-label-md text-label-md text-on-surface font-semibold bg-surface-container-low px-space-sm py-0.5 rounded">
                              {r.score ? \`\${r.score}V\` : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center p-4 text-xs text-on-surface-variant">Belum ada inspeksi.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-space-sm text-right">
              <span className="font-label-sm text-label-sm text-outline">Menampilkan max 5 terbaru</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:absolute print:inset-0 print:bg-white print:p-0 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-space-lg shadow-xl print:shadow-none print:max-w-full print:max-h-full">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4 print:hidden">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Detail Report - {selectedReportType}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="hidden print:block mb-6 text-center border-b border-outline-variant pb-4">
              <h1 className="text-2xl font-bold">Laporan Inspeksi {selectedReportType}</h1>
              <p className="text-sm text-on-surface-variant">{new Date(selectedReport.completed_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold">Asset ID</p>
                <p className="font-semibold text-sm">{selectedReport.asset_code || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold">Tanggal</p>
                <p className="font-semibold text-sm">{new Date(selectedReport.completed_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold">Mekanik</p>
                <p className="font-semibold text-sm">{selectedReport.mechanic_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold">Status/Kondisi</p>
                <p className="font-bold text-sm text-primary">{selectedReport.status || selectedReport.health_status}</p>
              </div>
            </div>

            {selectedReportType === 'FORKLIFT' && (
              <>
                <div className="mb-6 flex justify-between items-center bg-surface-container-low p-4 rounded-lg">
                  <span className="font-bold">Health Score:</span>
                  <span className={\`text-xl font-black \${selectedReport.health_status === 'CRITICAL' ? 'text-error' : 'text-primary'}\`}>{selectedReport.health_percentage}%</span>
                </div>
                
                <h3 className="font-bold border-b border-outline-variant pb-2 mb-4">Hasil Pengecekan</h3>
                <table className="w-full text-left text-sm mb-6 border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                      <th className="p-2 w-1/4">Kategori</th>
                      <th className="p-2 w-1/2">Item</th>
                      <th className="p-2 w-1/4 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.scores && selectedReport.scores.map((s: any, idx: number) => (
                      <tr key={idx} className="border-b border-surface-container-low">
                        <td className="p-2 text-on-surface-variant">{s.category_name}</td>
                        <td className="p-2">{s.item_name}</td>
                        <td className="p-2 text-center">
                          <span className={\`inline-block px-2 py-0.5 rounded font-bold \${s.score === 1 ? 'bg-error-container text-on-error-container' : s.score === 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}\`}>
                            {s.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedReportType === 'BATTERY' && (
              <>
                <h3 className="font-bold border-b border-outline-variant pb-2 mb-4">Data Teknis</h3>
                <table className="w-full text-left text-sm mb-6 border-collapse">
                  <tbody>
                    <tr className="border-b border-surface-container-low">
                      <th className="p-2 text-on-surface-variant w-1/3">Voltage Reading</th>
                      <td className="p-2 font-semibold">{selectedReport.voltage_reading} V</td>
                    </tr>
                    <tr className="border-b border-surface-container-low">
                      <th className="p-2 text-on-surface-variant w-1/3">Tindakan</th>
                      <td className="p-2">{selectedReport.action_taken || '-'}</td>
                    </tr>
                    <tr className="border-b border-surface-container-low">
                      <th className="p-2 text-on-surface-variant w-1/3">Catatan</th>
                      <td className="p-2">{selectedReport.notes || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            <div className="flex justify-end gap-3 print:hidden">
              <button onClick={() => window.print()} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low font-bold transition-colors">Print PDF</button>
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container font-bold transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

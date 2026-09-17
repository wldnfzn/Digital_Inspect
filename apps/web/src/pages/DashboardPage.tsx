import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = {
  healthy: '#16a34a',
  attention: '#f59e0b',
  critical: '#dc2626',
  primary: '#2563eb',
  secondary: '#3b82f6',
};

const NewDashboard = ({ stats, openDetail, exportPDF }: { stats: any, openDetail: any, exportPDF: any }) => {
  const totalInspections = (stats?.health_status?.good || 0) + (stats?.health_status?.attention || 0) + (stats?.health_status?.critical || 0);
  const goodPct = totalInspections ? Math.round((stats.health_status.good / totalInspections) * 100) : 0;
  const attPct = totalInspections ? Math.round((stats.health_status.attention / totalInspections) * 100) : 0;
  const critPct = totalInspections ? Math.round((stats.health_status.critical / totalInspections) * 100) : 0;

  const pieData = [
    { name: 'Bagus', value: goodPct, color: COLORS.healthy },
    { name: 'Perhatian', value: attPct, color: COLORS.attention },
    { name: 'Kritis', value: critPct, color: COLORS.critical },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-6" id="dashboard-content">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">forklift</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Forklift</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_forklifts || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Baterai</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_batteries || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">badge</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Karyawan</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_employees || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-success text-sm">task_alt</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inspeksi Selesai</p>
          <p className="text-3xl font-bold text-success">{stats?.completed_this_month || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-warning text-sm">pending_actions</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inspeksi Berjalan</p>
          <p className="text-3xl font-bold text-warning">{stats?.ongoing_tasks || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inspeksi Selesai vs Berjalan Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Aktivitas Inspeksi (Selesai vs Berjalan)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Line data={stats?.activity_inspections || []} type="monotone" dataKey="count" name="Selesai" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: COLORS.primary }} activeDot={{ r: 6 }} isAnimationActive={false} />
                <Line data={stats?.active_tasks_trend || []} type="monotone" dataKey="count" name="Berjalan" stroke={COLORS.attention} strokeWidth={3} dot={{ r: 4, fill: COLORS.attention }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 w-full text-left">Health Status Forklift</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" isAnimationActive={false} cornerRadius={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <span className="text-3xl font-bold text-gray-900">{totalInspections}</span>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Inspeksi</p>
          </div>
        </div>

        {/* Avg Fleet Health Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overall Index Avg Fleet Health</h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">Avg: {stats?.avg_fleet_health || 0}%</span>
          </div>
          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.avg_health_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="avg_score" name="Avg Health %" stroke={COLORS.secondary} strokeWidth={3} dot={{ r: 4, fill: COLORS.secondary }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Mechanic Inspections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[330px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inspeksi Mekanik Terbanyak</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <ul className="flex flex-col gap-3">
              {stats?.mechanic_inspections?.length > 0 ? stats.mechanic_inspections.map((m: any, i: number) => (
                <li key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{m.name.charAt(0)}</div>
                    <span className="font-medium text-sm text-gray-900">{m.name}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">{m.count} Laporan</span>
                </li>
              )) : (
                <li className="text-sm text-gray-500 text-center mt-4">Belum ada data mekanik.</li>
              )}
            </ul>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts Table */}
        <div className="bg-error-container border border-error/20 rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold text-on-error-container mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">warning</span> Active Alerts (Nilai 1)
          </h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <ul className="flex flex-col gap-3">
              {stats?.critical_alerts?.length > 0 ? stats.critical_alerts.map((alert: any, idx: number) => (
                <li key={idx} className="bg-white border border-error/10 border-l-4 border-l-error p-4 rounded-lg shadow-sm flex flex-col gap-2 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{alert.asset_code}</p>
                      <p className="text-sm text-error font-medium mt-1">Item: {alert.notes}</p>
                    </div>
                    <div className="flex gap-2">
                      {alert.photo_url && (
                        <a href={alert.photo_url} target="_blank" rel="noreferrer" className="bg-error/10 text-on-error-container hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors print:hidden flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">image</span> Foto
                        </a>
                      )}
                      <button onClick={() => openDetail(alert.report_id, 'FORKLIFT')} className="bg-error/10 text-on-error-container hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors print:hidden">
                        View
                      </button>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="text-sm text-on-error-container text-center mt-4 font-medium">Tidak ada critical alert.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Inspections Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <h3 className="text-lg font-semibold text-gray-900">Inspeksi Terakhir</h3>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recent_inspections?.length > 0 ? stats.recent_inspections.map((r: any, idx: number) => (
                  <tr key={idx} onClick={() => openDetail(r.id, r.asset_type)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-3 text-sm font-semibold text-primary">{r.asset_code}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{r.asset_type}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(r.date).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      {r.asset_type === 'FORKLIFT' ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.status === 'CRITICAL' ? 'bg-error-container text-on-error-container border border-error/20' :
                          r.status === 'ATTENTION' ? 'bg-warning-container text-on-warning-container border border-warning/20' :
                          'bg-success-container text-on-success-container border border-success/20'
                        }`}>
                          {r.score}%
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{r.score ? `${r.score}V` : '-'}</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center p-6 text-sm text-gray-500">Belum ada inspeksi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  
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
      try {
        let url = '/dashboard/stats?';
        if (startDate && endDate) {
          url += `startDate=${startDate}&endDate=${endDate}`;
        } else if (month) {
          url += `month=${month}`;
        }
        const response = await api.get(url);
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [month, startDate, endDate]);

  const openDetail = async (id: string, type: string) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/inspections/${type.toLowerCase()}/${id}`);
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
  
  return (
    <>
    <div className="pb-16 max-w-[1400px] w-full mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Utama</h2>
          <p className="text-base text-gray-500 mt-1">Ringkasan performa dan kesehatan aset perusahaan.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-3 border-r border-gray-200">
            <label className="text-sm font-medium text-gray-600">Bulan:</label>
            <input 
              type="month" 
              value={month} 
              onChange={e => { setMonth(e.target.value); setStartDate(''); setEndDate(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 px-3">
            <label className="text-sm font-medium text-gray-600">Range:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => { setStartDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
            <span className="text-gray-400 text-sm">sd</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => { setEndDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <button 
            onClick={handlePrint} 
            className="ml-auto bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary-fixed-variant flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
          </button>
        </div>
      </div>

      {stats ? (
        <NewDashboard stats={stats} openDetail={openDetail} exportPDF={handlePrint} />
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium">Loading dashboard data...</p>
           </div>
        </div>
      )}
    </div>
    </>
  );
};

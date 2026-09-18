import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Button, Badge, useToast, Modal } from '../components/ui';

const KPICard = ({ title, value, icon, bgClass, textClass }: { title: string, value: string | number, icon: string, bgClass: string, textClass: string }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} group-hover:scale-110 transition-transform`}>
      <span className={`material-symbols-outlined text-[24px] ${textClass}`}>{icon}</span>
    </div>
    <div>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
    </div>
  </div>
);

const NewDashboard = ({ stats, openDetail }: { stats: any, openDetail: any }) => {
  const totalInspections = (stats?.health_status?.good || 0) + (stats?.health_status?.attention || 0) + (stats?.health_status?.critical || 0);
  const goodPct = totalInspections ? Math.round((stats.health_status.good / totalInspections) * 100) : 0;
  const attPct = totalInspections ? Math.round((stats.health_status.attention / totalInspections) * 100) : 0;
  const critPct = totalInspections ? Math.round((stats.health_status.critical / totalInspections) * 100) : 0;

  const pieData = [
    { name: 'Bagus', value: goodPct, color: '#16a34a' },
    { name: 'Perhatian', value: attPct, color: '#f59e0b' },
    { name: 'Kritis', value: critPct, color: '#dc2626' },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-6" id="dashboard-content">
      
      {/* Top Row: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <KPICard title="Total Forklift" value={stats?.total_forklifts || 0} icon="forklift" bgClass="bg-blue-50" textClass="text-blue-600" />
        <KPICard title="Total Baterai" value={stats?.total_batteries || 0} icon="battery_charging_full" bgClass="bg-blue-50" textClass="text-blue-600" />
        <KPICard title="Total Karyawan" value={stats?.total_employees || 0} icon="badge" bgClass="bg-gray-50" textClass="text-gray-600" />
        <KPICard title="Inspeksi Selesai" value={stats?.completed_this_month || 0} icon="task_alt" bgClass="bg-green-50" textClass="text-success" />
        <KPICard title="Inspeksi Berjalan" value={stats?.ongoing_tasks || 0} icon="pending_actions" bgClass="bg-amber-50" textClass="text-warning" />
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Charts & Tables) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Aktivitas Inspeksi</h3>
                <p className="text-sm text-gray-500">Perbandingan inspeksi selesai dan berjalan</p>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                  <Area data={stats?.activity_inspections || []} type="monotone" dataKey="count" name="Selesai" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" isAnimationActive={false} />
                  <Area data={stats?.active_tasks_trend || []} type="monotone" dataKey="count" name="Berjalan" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorWarning)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trend Kesehatan Aset</h3>
                <p className="text-sm text-gray-500">Rata-rata skor inspeksi harian</p>
              </div>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                Avg: {stats?.avg_fleet_health || 0}%
              </span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.avg_health_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                  <Tooltip formatter={(val: any) => `${val}%`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="avg_score" name="Avg Health %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Inspections Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900">Inspeksi Terakhir</h3>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left divide-y divide-gray-100">
                <thead className="bg-gray-50/80 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aset</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.recent_inspections?.length > 0 ? stats.recent_inspections.map((r: any, idx: number) => (
                    <tr key={idx} onClick={() => openDetail(r.id, r.asset_type)} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 cursor-pointer group">
                      <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{r.asset_code}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">{r.asset_type === 'FORKLIFT' ? 'forklift' : 'battery_charging_full'}</span>
                          {r.asset_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(r.date).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</td>
                      <td className="px-5 py-3.5 text-sm">
                        {r.asset_type === 'FORKLIFT' ? (
                          <Badge variant={r.status === 'CRITICAL' ? 'critical' : r.status === 'ATTENTION' ? 'attention' : 'healthy'}>
                            {r.score}%
                          </Badge>
                        ) : (
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{r.score ? `${r.score}V` : '-'}</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center p-8 text-sm text-gray-500">Belum ada data inspeksi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="flex flex-col gap-6">
          
          {/* Health Score Hero */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg p-8 text-white flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
            
            <h3 className="text-white/90 font-semibold mb-6 relative z-10 text-lg">Health Status Aset</h3>
            
            <div className="w-full h-[200px] relative z-10 -mt-4 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" isAnimationActive={false} cornerRadius={6} stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value}%`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                 <span className="text-3xl font-extrabold text-white">{totalInspections}</span>
                 <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mt-1">Total Unit</span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full justify-center relative z-10 mt-2">
               {pieData.map((d, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                      <span className="text-[11px] text-white/80 uppercase font-medium">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold">{d.value}%</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-error-container border border-error/20 rounded-2xl p-6 shadow-sm flex flex-col max-h-[500px]">
            <h3 className="text-lg font-bold text-on-error-container mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[22px]">warning</span> Active Alerts
            </h3>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <ul className="flex flex-col gap-3">
                {stats?.critical_alerts?.length > 0 ? stats.critical_alerts.map((alert: any, idx: number) => (
                  <li key={idx} className="bg-white border border-error/10 border-l-4 border-l-error p-4 rounded-xl shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-0.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{alert.asset_code}</p>
                        <p className="text-sm text-error font-medium mt-1 leading-snug">{alert.notes}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <Button variant="destructive" size="sm" onClick={() => openDetail(alert.report_id, 'FORKLIFT')}>
                          Lihat Detail
                        </Button>
                        {alert.photo_url && (
                          <button onClick={() => setPreviewImage(alert.photo_url)} className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 py-2 rounded-lg text-xs font-bold transition-colors print:hidden flex justify-center items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">image</span> Foto
                          </button>
                        )}
                    </div>
                  </li>
                )) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-error/30 mb-2">check_circle</span>
                    <p className="text-sm text-on-error-container font-medium">Tidak ada alert kritikal.</p>
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* Mechanic Leaderboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">engineering</span>
              Top Mekanik
            </h3>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar max-h-[300px]">
              <ul className="flex flex-col gap-3">
                {stats?.mechanic_inspections?.length > 0 ? stats.mechanic_inspections.map((m: any, i: number) => (
                  <li key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{m.name}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">{m.count} Laporan</span>
                  </li>
                )) : (
                  <p className="text-sm text-gray-500 text-center mt-4">Belum ada data mekanik.</p>
                )}
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      const url = type === 'FORKLIFT' ? `/reports/forklift/${id}` : `/reports/battery/${id}`;
      const res = await api.get(url);
      setSelectedReport(res.data.data);
      setSelectedReportType(type);
    } catch (err) {
      console.error(err);
      toast('Gagal memuat detail laporan', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <>
    <div className="pb-16 w-full mx-auto">
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
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 px-3">
            <label className="text-sm font-medium text-gray-600">Range:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => { setStartDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
            <span className="text-gray-400 text-sm">sd</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => { setEndDate(e.target.value); setMonth(''); }} 
              className="text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 px-3 py-1.5 cursor-pointer outline-none transition-all"
            />
          </div>
          <div className="ml-auto">
            <Button variant="primary" icon="download" onClick={handlePrint}>Export PDF</Button>
          </div>
        </div>
      </div>

      {stats ? (
        <NewDashboard stats={stats} openDetail={openDetail} />
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium">Loading dashboard data...</p>
           </div>
        </div>
      )}
    </div>

    <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="max-w-2xl">
      <Modal.Header onClose={() => setSelectedReport(null)}>Detail Laporan {selectedReportType}</Modal.Header>
      <Modal.Body>
        {selectedReport ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Aset</p>
                <p className="font-bold text-gray-900 mt-1">{selectedReport.asset_code}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Skor</p>
                <p className="font-bold text-gray-900 mt-1">{selectedReport.score}%</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <div className="mt-1">
                  <Badge variant={selectedReport.status === 'CRITICAL' ? 'critical' : selectedReport.status === 'ATTENTION' ? 'attention' : 'healthy'}>
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Catatan</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedReport.notes || '-'}</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="font-bold mb-2">Item Inspeksi</p>
              <ul className="flex flex-col gap-2">
                {selectedReport.items && selectedReport.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-700">{item.name}</span>
                    <Badge variant={item.condition === 'GOOD' ? 'healthy' : item.condition === 'BAD' ? 'critical' : 'attention'}>
                      {item.condition}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setSelectedReport(null)}>Tutup</Button>
      </Modal.Footer>
      </Modal>

      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="max-w-3xl">
        <Modal.Header onClose={() => setPreviewImage(null)}>Pratinjau Foto</Modal.Header>
        <Modal.Body>
          {previewImage && (
            <div className="flex justify-center items-center bg-gray-50 rounded-xl p-2">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] rounded-lg object-contain" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewImage(null)}>Tutup</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

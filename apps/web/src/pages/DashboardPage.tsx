import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { BatteryPrintLayout } from '../components/BatteryPrintLayout';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// --- Dashboard Components ---
const DashboardHeader = ({ title, subtitle, month, setMonth }: { title: string, subtitle: string, month?: string, setMonth?: any }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
    <div>
      <h2 className="font-headline-xl text-headline-xl text-on-background">{title}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{subtitle}</p>
    </div>
    <div className="flex gap-sm">
      {setMonth && (
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:border-outline transition-colors outline-none focus:border-primary cursor-pointer" />
      )}
      <button className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
        Export Report
      </button>
    </div>
  </div>
);

const ManagerDashboard = ({ stats, openDetail, openAllAlerts, month, setMonth }: { stats: any, openDetail: any, openAllAlerts: any, month?: string, setMonth?: any }) => {
  const totalInspections = (stats?.health_status?.good || 0) + (stats?.health_status?.attention || 0) + (stats?.health_status?.critical || 0);
  const goodPct = totalInspections ? Math.round((stats.health_status.good / totalInspections) * 100) : 0;
  const attPct = totalInspections ? Math.round((stats.health_status.attention / totalInspections) * 100) : 0;
  const critPct = totalInspections ? Math.round((stats.health_status.critical / totalInspections) * 100) : 0;

  // Group critical alerts by report_id so we know how many items failed per forklift
  const groupedAlerts = stats?.critical_alerts?.reduce((acc: any, curr: any) => {
    const key = curr.report_id;
    if (!acc[key]) {
      acc[key] = {
        asset_code: curr.asset_code,
        customer_name: curr.customer_name,
        report_id: curr.report_id,
        count: 0,
        items: []
      };
    }
    acc[key].count++;
    acc[key].items.push(curr.notes);
    return acc;
  }, {});
  const alertList: any[] = groupedAlerts ? Object.values(groupedAlerts) : [];

  return (
  <>
    <DashboardHeader title="Dashboard Operasional" subtitle="Real-time System Overview" month={month} setMonth={setMonth} />
    
    {/* Bento Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm hover:border-outline transition-colors group cursor-default">
        <div className="flex justify-between items-start">
          <div className="p-sm bg-primary-container text-on-primary-container rounded">
            <span className="material-symbols-outlined">forklift</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">Total</span>
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl text-on-background group-hover:text-primary transition-colors">
            {stats?.total_forklifts ?? 0}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Forklift</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm hover:border-outline transition-colors group cursor-default">
        <div className="flex justify-between items-start">
          <div className="p-sm bg-tertiary-container text-on-tertiary-container rounded">
            <span className="material-symbols-outlined">battery_charging_full</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">Total</span>
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl text-on-background group-hover:text-tertiary transition-colors">
            {stats?.total_batteries ?? 0}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Battery</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm hover:border-outline transition-colors group cursor-default border-l-2 border-l-[#16a34a]">
        <div className="flex justify-between items-start">
          <div className="p-sm bg-[#dcfce7] text-[#166534] rounded">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">Bulan Ini</span>
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl text-on-background group-hover:text-[#16a34a] transition-colors">
            {stats?.completed_this_month ?? 0}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Inspeksi Selesai</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm hover:border-outline transition-colors group cursor-default border-l-2 border-l-[#f59e0b]">
        <div className="flex justify-between items-start">
          <div className="p-sm bg-[#fef3c7] text-[#b45309] rounded">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">Aktif</span>
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl text-on-background group-hover:text-[#f59e0b] transition-colors">
            {stats?.ongoing_tasks ?? 0}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Tugas Berjalan</p>
        </div>
      </div>
    </div>


    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-md">
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Health Status */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col h-full">
          <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">Health Status</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#16a34a 0% ${goodPct}%, #eab308 ${goodPct}% ${goodPct + attPct}%, #dc2626 ${goodPct + attPct}% 100%)` }}>
              <div className="w-24 h-24 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="font-headline-lg text-headline-lg font-bold">{totalInspections}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Inspections</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-auto pt-md border-t border-outline-variant">
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Bagus ({goodPct}%)</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Perhatian ({attPct}%)</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Buruk ({critPct}%)</span>
            </div>
          </div>
        </div>
        {/* Avg Health */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <h3 className="font-headline-lg text-headline-lg text-on-background mb-md relative z-10">Avg Fleet Health</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="relative w-40 h-20 overflow-hidden mb-4">
              <div className="w-40 h-40 rounded-full border-12 border-surface-container-high absolute bottom-0"></div>
              <div className="w-40 h-40 rounded-full border-12 border-transparent border-t-[#3b82f6] border-l-[#3b82f6] absolute bottom-0 transform rotate-35"></div>
            </div>
            <div className="absolute bottom-10 flex flex-col items-center">
              <span className="font-headline-xl text-headline-xl text-primary font-bold">{stats?.avg_fleet_health || 0}%</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Overall Index</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts Panel */}
      <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-md flex flex-col h-full">
        <div className="flex justify-between items-center mb-md border-b border-[#fecdd3] pb-sm">
          <h3 className="font-headline-lg text-headline-lg text-[#9f1239] flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#e11d48]">warning</span>
            Active Alerts
          </h3>
          <button onClick={openAllAlerts} className="font-label-sm text-label-sm text-[#e11d48] hover:underline flex items-center cursor-pointer bg-transparent border-none">
            View All <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </button>
        </div>
        <ul className="flex flex-col gap-sm flex-1 overflow-y-auto max-h-[300px]">
          {alertList.length > 0 ? alertList.slice(0, 5).map((alert: any, idx: number) => (
            <li key={idx} className="bg-surface-container-lowest border border-[#fecdd3] p-sm rounded flex flex-col gap-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-[#e11d48] mt-0.5" style={{ fontSize: '18px' }}>error</span>
                  <div className="pr-2">
                    <p className="font-label-sm text-label-sm font-bold text-on-background">{alert.asset_code}</p>
                    <p className="font-caption text-caption text-[#e11d48] mt-xs font-semibold">{alert.count} Critical Findings</p>
                    <p className="font-caption text-caption text-on-surface-variant line-clamp-1 truncate max-w-[150px]">{alert.items.join(', ')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openDetail(alert.report_id, 'FORKLIFT')}
                  className="bg-[#fee2e2] text-[#9f1239] hover:bg-[#fecaca] px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  View
                </button>
              </div>
            </li>
          )) : (
            <li className="p-sm text-center text-on-surface-variant text-sm">No critical alerts currently.</li>
          )}
        </ul>
      </div>
    </div>

    {/* Recent Inspections Table */}
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 className="font-headline-lg text-headline-lg text-on-background">Recent Inspections</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
              <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Asset ID</th>
              <th className="p-sm font-label-sm text-label-sm font-semibold">Type</th>
              <th className="p-sm font-label-sm text-label-sm font-semibold">Date</th>
              <th className="p-sm font-label-sm text-label-sm font-semibold">Score / Status</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-background">
            {stats?.recent_inspections?.length > 0 ? stats.recent_inspections.map((r: any) => (
              <tr key={r.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group cursor-pointer">
                <td className="p-sm pl-md font-asset-id text-asset-id font-medium text-primary">{r.asset_code}</td>
                <td className="p-sm text-on-surface-variant">{r.asset_type}</td>
                <td className="p-sm text-on-surface-variant">{new Date(r.date).toLocaleString()}</td>
                <td className="p-sm">
                  {r.asset_type === 'FORKLIFT' ? (
                    <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm border ${
                      r.status === 'CRITICAL' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' :
                      r.status === 'ATTENTION' ? 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]' :
                      'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        r.status === 'CRITICAL' ? 'bg-[#dc2626]' :
                        r.status === 'ATTENTION' ? 'bg-[#f59e0b]' :
                        'bg-[#16a34a]'
                      }`}></span> {r.score}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-xs px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] font-label-sm text-label-sm border border-[#bbf7d0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span> {r.score || '-'}V
                    </span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No recent inspections</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
  );
};

const trendData = [
  { name: 'Sep', health: 82 },
  { name: 'Oct', health: 85 },
  { name: 'Nov', health: 84 },
  { name: 'Dec', health: 89 },
  { name: 'Jan', health: 91 },
  { name: 'Feb', health: 90 },
  { name: 'Mar', health: 87 },
  { name: 'Apr', health: 82 },
  { name: 'May', health: 86 },
  { name: 'Jun', health: 89 },
  { name: 'Jul', health: 92 },
  { name: 'Aug', health: 95 },
];

const completionData = [
  { name: 'May', rate: 100 },
  { name: 'Jun', rate: 95 },
  { name: 'Jul', rate: 100 },
  { name: 'Aug', rate: 82 },
];

const DirectorDashboard = ({ stats, month, setMonth }: { stats: any, month?: string, setMonth?: any }) => (
  <>
    <DashboardHeader title="Executive Dashboard" subtitle="PT United Multilift Perkasa" month={month} setMonth={setMonth} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">Fleet Health Trend (Coming Soon)</h3>
        <div className="flex-1 min-h-[250px] flex items-center justify-center border border-dashed rounded bg-surface-container-low text-on-surface-variant">
          Requires historical data collection
        </div>
      </div>
      
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">Inspection Completion Rate (Coming Soon)</h3>
        <div className="flex-1 min-h-[250px] flex items-center justify-center border border-dashed rounded bg-surface-container-low text-on-surface-variant">
          Requires historical data collection
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mt-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        <div className="p-md border-b border-outline-variant bg-surface-bright">
          <h3 className="font-headline-lg text-headline-lg text-on-background">Customer Summary</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant text-label-sm">
            <tr>
              <th className="p-sm pl-md">Customer</th>
              <th className="p-sm">FL Count</th>
              <th className="p-sm pr-md">BT Count</th>
            </tr>
          </thead>
          <tbody className="text-body-md">
            {stats?.customer_summary?.length > 0 ? stats.customer_summary.map((c: any, idx: number) => (
              <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-low">
                <td className="p-sm pl-md font-semibold">{c.name || 'Internal'}</td>
                <td className="p-sm">{c.fl_count}</td>
                <td className="p-sm pr-md">{c.bt_count}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-sm text-center">No customer data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#fff1f2] border border-[#fecdd3] p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-[#9f1239] flex items-center gap-xs mb-md border-b border-[#fecdd3] pb-sm">
          <span className="material-symbols-outlined text-[#e11d48]">warning</span>
          Critical Alerts
        </h3>
        <ul className="flex flex-col gap-sm overflow-y-auto">
          {stats?.critical_alerts?.length > 0 ? stats.critical_alerts.map((alert: any, idx: number) => (
            <li key={idx} className="bg-surface-container-lowest p-sm rounded border border-[#fecdd3] flex items-start gap-sm">
              <span className="material-symbols-outlined text-error">error</span>
              <div>
                <p className="font-bold text-sm">{alert.asset_code} @ {alert.customer_name || 'Internal'}</p>
                <p className="text-xs text-on-surface-variant">{alert.notes || 'CRITICAL FLAG'}</p>
              </div>
            </li>
          )) : (
            <li className="p-sm text-center text-on-surface-variant text-sm">No critical alerts currently.</li>
          )}
        </ul>
      </div>
    </div>
  </>
);

const AdminDashboard = ({ stats, month, setMonth }: { stats: any, month: string, setMonth: any }) => (
  <>
    <DashboardHeader title="Admin Overview" subtitle="System Administration" month={month} setMonth={setMonth} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mt-md">
      {/* Activity Inspection Line Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">Activity Inspection</h3>
        <div className="flex-1 min-h-[300px]">
          {stats?.activity_inspections?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.activity_inspections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Inspections" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">No activity data for this month.</div>
          )}
        </div>
      </div>

      {/* Avg Health Per Asset */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">AVG Health Per Forklift</h3>
        <div className="flex-1 min-h-[300px] overflow-y-auto max-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant">
              <tr>
                <th className="py-2 px-3 font-semibold text-sm">Asset Code</th>
                <th className="py-2 px-3 font-semibold text-sm text-right">Avg Health</th>
              </tr>
            </thead>
            <tbody>
              {stats?.avg_health_per_asset?.length > 0 ? (
                stats.avg_health_per_asset.map((asset: any, idx: number) => (
                  <tr key={idx} className="border-b border-outline-variant">
                    <td className="py-2 px-3 font-medium">{asset.asset_code}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold ${asset.avg_health < 50 ? 'text-[#dc2626]' : asset.avg_health < 80 ? 'text-[#f59e0b]' : 'text-[#16a34a]'}`}>
                        {asset.avg_health}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} className="py-4 text-center text-sm text-on-surface-variant">No health data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mechanic Inspection Count */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md">Inspections By Mechanic</h3>
        <div className="flex-1 min-h-[300px]">
          {stats?.mechanic_inspections?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.mechanic_inspections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Inspections" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">No inspection data.</div>
          )}
        </div>
      </div>
      
      {/* Overall Stats summary */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col justify-center items-center">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-md w-full text-left">Overview</h3>
        <div className="grid grid-cols-2 gap-4 w-full">
           <div className="bg-surface-container-low p-4 rounded text-center">
              <p className="text-3xl font-bold text-primary">{stats?.total_forklifts ?? 0}</p>
              <p className="text-sm text-on-surface-variant">Total Forklifts</p>
           </div>
           <div className="bg-surface-container-low p-4 rounded text-center">
              <p className="text-3xl font-bold text-tertiary">{stats?.total_batteries ?? 0}</p>
              <p className="text-sm text-on-surface-variant">Total Batteries</p>
           </div>
           <div className="bg-surface-container-low p-4 rounded text-center col-span-2 border-t-2 border-[#16a34a]">
              <p className="text-3xl font-bold text-[#16a34a] mt-2">{stats?.completed_this_month ?? 0}</p>
              <p className="text-sm text-on-surface-variant">Inspections Completed (Selected Month)</p>
           </div>
        </div>
      </div>
    </div>
  </>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/dashboard/stats${month ? '?month=' + month : ''}`);
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, [month]);

  if (!stats) {
    return <div className="p-8 text-center text-on-surface-variant">Loading dashboard data...</div>;
  }

  const openDetail = (id: string, type: string) => {
    setLoadingDetail(true);
    setSelectedReportType(type);
    api.get(`/inspections/${type.toLowerCase()}/${id}`)
      .then(res => {
        setSelectedReport(res.data.data);
        setLoadingDetail(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingDetail(false);
      });
  };

  const renderDashboard = () => {
    if (user?.role === UserRole.DIRECTOR) return <DirectorDashboard stats={stats} />;
    if (user?.role === UserRole.SUPER_ADMIN) return <AdminDashboard stats={stats} month={month} setMonth={setMonth} />;
    return <ManagerDashboard stats={stats} openDetail={openDetail} openAllAlerts={() => setShowAllAlerts(true)} month={month} setMonth={setMonth} />;
  };

  // Group critical alerts for the All Alerts Modal
  const groupedAlerts = stats?.critical_alerts?.reduce((acc: any, curr: any) => {
    const key = curr.report_id;
    if (!acc[key]) {
      acc[key] = {
        asset_code: curr.asset_code,
        customer_name: curr.customer_name,
        report_id: curr.report_id,
        count: 0,
        items: []
      };
    }
    acc[key].count++;
    acc[key].items.push(curr.notes);
    return acc;
  }, {});
  const alertList: any[] = groupedAlerts ? Object.values(groupedAlerts) : [];

  return (
    <>
      {renderDashboard()}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg font-bold">Loading details...</div>
        </div>
      )}

      {showAllAlerts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-bright rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-[#fecdd3]">
            <div className="p-4 border-b border-[#fecdd3] flex justify-between items-center bg-[#fff1f2]">
              <h3 className="font-headline-sm text-[#9f1239] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[#e11d48]">warning</span> All Active Alerts
              </h3>
              <button onClick={() => setShowAllAlerts(false)} className="material-symbols-outlined cursor-pointer text-[#e11d48] hover:text-[#9f1239]">close</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-surface-container-lowest">
              <ul className="flex flex-col gap-sm">
                {alertList.length > 0 ? alertList.map((alert: any, idx: number) => (
                  <li key={idx} className="bg-white border border-[#fecdd3] p-sm rounded flex flex-col gap-sm shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-sm">
                        <span className="material-symbols-outlined text-[#e11d48] mt-0.5" style={{ fontSize: '20px' }}>error</span>
                        <div className="pr-2">
                          <p className="font-label-md text-label-md font-bold text-on-background">{alert.asset_code}</p>
                          <p className="font-caption text-caption text-on-surface-variant mb-xs">{alert.customer_name || 'Internal'}</p>
                          <p className="font-label-sm text-label-sm text-[#e11d48] font-semibold">{alert.count} Critical Findings</p>
                          <ul className="list-disc pl-4 mt-1">
                            {alert.items.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-on-surface-variant">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setShowAllAlerts(false);
                          openDetail(alert.report_id, 'FORKLIFT');
                        }}
                        className="bg-[#fee2e2] text-[#9f1239] hover:bg-[#fecaca] px-4 py-2 rounded text-sm font-bold transition-colors cursor-pointer shrink-0 border border-[#fecdd3]"
                      >
                        View Full Report
                      </button>
                    </div>
                  </li>
                )) : (
                  <li className="p-8 text-center text-on-surface-variant text-md">No critical alerts currently.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedReport && !loadingDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:static print:block print:p-0">
          <div className="bg-surface-bright rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:w-full print:max-w-none print:overflow-visible print:block print:rounded-none">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm">
                Report Detail - {selectedReport.asset_code}
                <span className="text-sm font-normal text-on-surface-variant ml-2">
                  (No: {selectedReport.additional_data?.service_report_no || selectedReport.full_report_data?.service_report_no || 'N/A'})
                </span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="no-print bg-primary text-on-primary px-3 py-1 rounded text-sm cursor-pointer hover:opacity-90 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span> Print PDF
                </button>
                <button onClick={() => setSelectedReport(null)} className="no-print material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-on-surface">close</button>
              </div>
            </div>
            
            <div id="printable-report" className="p-6 overflow-y-auto flex-1 bg-white text-black print:block print:overflow-visible print:p-0">
              <div className="print:hidden">
                <div className="text-center mb-6 border-b-2 border-black pb-4 hidden print:block">
                  <h1 className="text-2xl font-bold uppercase">Service Report</h1>
                  <h2 className="text-lg">No: {selectedReport.additional_data?.service_report_no || selectedReport.full_report_data?.service_report_no || 'N/A'}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-body-md border border-gray-300 p-4">
                  {selectedReportType === 'FORKLIFT' && (
                    <>
                      <div><strong>Model:</strong> {selectedReport.model || '-'}</div>
                      <div><strong>Year:</strong> {selectedReport.year || '-'}</div>
                    </>
                  )}
                  <div><strong>Client:</strong> {selectedReport.customer_name || 'Internal'}</div>
                  <div><strong>Address:</strong> {selectedReport.customer_address || '-'}</div>
                  <div><strong>Mechanic:</strong> {selectedReport.mechanic}</div>
                  <div>
                    <strong>Time:</strong> {selectedReport.additional_data?.started_at ? new Date(selectedReport.additional_data.started_at).toLocaleString() : '-'} s/d {new Date(selectedReport.completed_at).toLocaleString()}
                  </div>
                  {selectedReport.additional_data?.location && (
                    <div className="col-span-2">
                      <strong>Location:</strong> {selectedReport.additional_data.location.latitude.toFixed(4)}, {selectedReport.additional_data.location.longitude.toFixed(4)}
                    </div>
                  )}
                  {selectedReportType === 'FORKLIFT' && <div><strong>Health Score:</strong> {selectedReport.health_percentage}%</div>}
                </div>

                {selectedReportType === 'FORKLIFT' && selectedReport.additional_data && (
                  <div className="mb-6 p-4 border border-gray-300 space-y-2 text-sm">
                    <h4 className="font-bold mb-2 border-b border-gray-300 pb-2">General Data</h4>
                    <div><strong className="inline-block w-32">Hour Meter:</strong> {selectedReport.additional_data.hour_meter || '-'}</div>
                    <div><strong className="inline-block w-32">Service Type:</strong> {selectedReport.additional_data.service_type || '-'}</div>
                    <div><strong className="inline-block w-32">Working Cond:</strong> {selectedReport.additional_data.working_conditions?.join(', ') || '-'}</div>
                  </div>
                )}

                {selectedReportType === 'FORKLIFT' && selectedReport.scores && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">Checklist Items</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100"><th className="border border-gray-300 p-2">Category</th><th className="border border-gray-300 p-2">Item</th><th className="border border-gray-300 p-2 w-20 text-center">Score</th></tr>
                      </thead>
                      <tbody>
                        {selectedReport.scores.map((s: any, idx: number) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 p-2 text-sm">{s.category_name}</td>
                            <td className="border border-gray-300 p-2 text-sm">{s.item_name} {s.photo_url && <a href={s.photo_url} target="_blank" rel="noreferrer" className="text-blue-500 underline ml-2 no-print">(Bukti Foto)</a>}</td>
                            <td className={`border border-gray-300 p-2 text-center font-bold ${s.score === 3 ? 'text-green-600' : s.score === 2 ? 'text-yellow-600' : 'text-red-600'}`}>{s.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.parts_used?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">Based On Above Report We Used</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Qty</th><th className="border border-gray-300 p-2">Description</th><th className="border border-gray-300 p-2">Part No.</th></tr></thead>
                      <tbody>
                        {selectedReport.additional_data.parts_used.map((p: any, idx: number) => (
                          <tr key={idx}><td className="border border-gray-300 p-2 text-sm">{p.qty}</td><td className="border border-gray-300 p-2 text-sm">{p.description}</td><td className="border border-gray-300 p-2 text-sm">{p.part_no}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.parts_recommended?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">We Recomend You To Order</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Qty</th><th className="border border-gray-300 p-2">Description</th><th className="border border-gray-300 p-2">Part No.</th></tr></thead>
                      <tbody>
                        {selectedReport.additional_data.parts_recommended.map((p: any, idx: number) => (
                          <tr key={idx}><td className="border border-gray-300 p-2 text-sm">{p.qty}</td><td className="border border-gray-300 p-2 text-sm">{p.description}</td><td className="border border-gray-300 p-2 text-sm">{p.part_no}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.action_flags?.length > 0 && (
                  <div className="mb-6 p-4 border border-gray-300">
                    <h4 className="font-bold mb-2">Action Flags:</h4>
                    <p>{selectedReport.additional_data.action_flags.join(', ')}</p>
                  </div>
                )}

                <div className="mt-12 pt-8 flex justify-between px-10 hidden print:flex">
                  <div className="text-center">
                    <p className="mb-16">Customer Signature</p>
                    <p className="border-t border-black pt-2">(................................................)</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-16">Mechanic Signature</p>
                    <p className="border-t border-black pt-2">({selectedReport.mechanic})</p>
                  </div>
                </div>
                {selectedReport.notes && <div className="mt-4 p-4 bg-surface-container-low rounded"><strong className="block mb-1">Notes:</strong> {selectedReport.notes}</div>}

                {selectedReportType === 'BATTERY' && selectedReport.full_report_data && (
                  <div>
                    <h4 className="font-bold mb-2">Battery Service Detail</h4>
                    <div className="p-4 bg-surface-container-low rounded-lg space-y-4 text-sm">
                      <div><strong>Condition during servicing:</strong> {selectedReport.full_report_data.condition_during_servicing || '-'}</div>
                      
                      <div>
                        <strong className="block mb-2">Charger Info:</strong>
                        <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary">
                          <div>Brand: {selectedReport.full_report_data.charger?.brand || '-'}</div>
                          <div>Input: {selectedReport.full_report_data.charger?.input || '-'}</div>
                          <div>Output: {selectedReport.full_report_data.charger?.output || '-'}</div>
                          <div>Condition: {selectedReport.full_report_data.charger?.condition || '-'}</div>
                        </div>
                      </div>

                      <div>
                        <strong className="block mb-2">Other Battery Info:</strong>
                        <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary">
                          {Object.entries(selectedReport.full_report_data.other_info || {}).map(([k, v]) => (
                            <div key={k} className="capitalize">{k}: <span className="font-medium">{v as string}</span></div>
                          ))}
                        </div>
                      </div>

                      {selectedReport.full_report_data.cells && (
                        <div>
                          <strong className="block mb-2">40 Cells Readings (S.G / Volts):</strong>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                            {selectedReport.full_report_data.cells.map((c: any, i: number) => (
                              <div key={i} className="text-xs border p-1 bg-white text-center">
                                <div className="font-bold text-[10px] text-primary border-b mb-1">C{i+1}</div>
                                <div>{c.sg || '-'}</div>
                                <div>{c.v || '-'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedReport.full_report_data.work_done && (
                        <div><strong className="block mb-1">Work Done:</strong> {selectedReport.full_report_data.work_done}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* EXACT NCR PDF LAYOUT (ONLY SHOWN IN PRINT) */}
              {selectedReportType === 'BATTERY' ? (
                <BatteryPrintLayout report={selectedReport} />
              ) : (
                <div className="hidden print:block text-[10px] leading-tight font-sans">
                {/* Header */}
                <div className="flex border-b-2 border-black pb-2 mb-2 items-center">
                  <div className="w-1/4">
                    <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-4xl">M</div>
                  </div>
                  <div className="w-3/4 text-center">
                    <h1 className="text-xl font-bold text-black uppercase tracking-wider mb-1">PT UNITED MULTILIFT PERKASA</h1>
                    <p className="font-bold text-[9px]">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423</p>
                    <p className="font-bold text-[9px]">Tel. 021 - 8240 1141 (Hunting)</p>
                    <p className="text-[9px]">www.multiliftperkasa.com • e-mail: marketing@multiliftperkasa.com</p>
                  </div>
                </div>

                {/* Info Block */}
                <div className="grid grid-cols-3 gap-2 mb-2 text-[9px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-16 font-bold uppercase">CLIENT</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.customer_name}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">ADDRESS</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.customer_address}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">MODEL</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.model || '-'}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">YEAR</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.year || '-'}</span></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-20 font-bold uppercase">PRODUCT</span><span>: </span><span className="flex-1 border-b border-black uppercase">{selectedReportType}</span></div>
                    <div className="flex"><span className="w-20 font-bold uppercase">HOUR METER</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.additional_data?.hour_meter || '-'}</span></div>
                    <div className="flex"><span className="w-20 font-bold uppercase">SERIAL NO</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.asset_code}</span></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-24 font-bold uppercase">DATE</span><span className="flex-1 border-b border-black">{new Date(selectedReport.completed_at).toLocaleDateString()}</span></div>
                    <div className="flex"><span className="w-24 font-bold uppercase">SERVICE REPORT NO.</span><span className="flex-1 border-b border-black">{selectedReport.additional_data?.service_report_no || '-'}</span></div>
                    
                    <div className="mt-2 flex flex-col gap-1 text-[8px]">
                      {['Warranty Service', 'Contract Service', 'Non-Contract Service'].map(svc => (
                        <div key={svc} className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-black flex items-center justify-center font-bold">
                            {selectedReport.additional_data?.service_type === svc ? 'X' : ''}
                          </div>
                          <span className="uppercase font-bold">{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Working Conditions */}
                <div className="flex items-center gap-2 mb-3 text-[9px]">
                  <span className="font-bold w-24">WORKING CONDITION</span>
                  {['Indoor', 'Outdoor', 'Wet/Dry', 'Dusty', 'Aggressive'].map(cond => (
                    <div key={cond} className="border border-black px-1 uppercase font-bold text-[8px]">
                      {selectedReport.additional_data?.working_conditions?.includes(cond) ? '☑' : '☐'} {cond}
                    </div>
                  ))}
                </div>

                {/* Checklist (3 Columns Masonry) */}
                <div className="columns-3 gap-4 mb-4">
                  {Object.entries(
                    (selectedReport.scores || []).reduce((acc: any, curr: any) => {
                      if (!acc[curr.category_name]) acc[curr.category_name] = [];
                      acc[curr.category_name].push(curr);
                      return acc;
                    }, {})
                  ).map(([catName, items]: [string, any]) => (
                    <div key={catName} className="break-inside-avoid mb-2">
                      <div className="flex justify-between font-bold uppercase mb-1 border-b border-black text-[9px]">
                        <span>{catName}</span>
                        <span className="tracking-[0.2em] font-normal">1 2 3</span>
                      </div>
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center border border-black border-b-0 last:border-b text-[7px] leading-none">
                          <div className="w-4 border-r border-black text-center py-0.5">{idx + 1}</div>
                          <div className="flex-1 px-1 uppercase truncate py-0.5">{item.item_name}</div>
                          <div className="flex border-l border-black w-[45px] py-0.5">
                            <div className="w-1/3 border-r border-black text-center">{item.score === 1 ? 'X' : ''}</div>
                            <div className="w-1/3 border-r border-black text-center">{item.score === 2 ? 'X' : ''}</div>
                            <div className="w-1/3 text-center">{item.score === 3 ? 'X' : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend & Notes */}
                <div className="flex gap-4 mb-4 text-[9px]">
                  <div className="flex-1">
                    <p className="font-bold mb-1">Report of any other works carried out:</p>
                    <div className="border-b border-black min-h-[40px] italic p-1">{selectedReport.notes}</div>
                  </div>
                  <div className="w-64">
                    <p><strong>Report:</strong> Col. 1 - Item requires Immediate repair resp. replacement</p>
                    <p className="ml-10">Col. 2 - Item requires Attention</p>
                    <p className="ml-10">Col. 3 - Item is in order / completed</p>
                  </div>
                </div>

                {/* Parts Tables */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-[8px]">
                  <div>
                    <p className="text-center font-bold mb-1">Based on above report we used</p>
                    <table className="w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-1 w-8">QTY</th>
                          <th className="border border-black p-1">DESCRIPTION</th>
                          <th className="border border-black p-1 w-16">PART. No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.max(5, selectedReport.additional_data?.parts_used?.length || 0) }).map((_, i) => {
                          const p = selectedReport.additional_data?.parts_used?.[i] || {};
                          return (
                            <tr key={i}>
                              <td className="border border-black p-1 text-center h-4">{p.qty || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.description || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.part_no || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-center font-bold mb-1">We recommend you to order</p>
                    <table className="w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-1 w-8">QTY</th>
                          <th className="border border-black p-1">DESCRIPTION</th>
                          <th className="border border-black p-1 w-16">PART. No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.max(5, selectedReport.additional_data?.parts_recommended?.length || 0) }).map((_, i) => {
                          const p = selectedReport.additional_data?.parts_recommended?.[i] || {};
                          return (
                            <tr key={i}>
                              <td className="border border-black p-1 text-center h-4">{p.qty || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.description || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.part_no || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures & Actions */}
                <p className="font-bold text-[7px] uppercase mb-4 text-center">Signing of the report constitute an intruction for works to be carried out where an official order may or may not follow</p>
                
                <div className="flex justify-between items-end mb-4 text-[9px]">
                  <div className="text-center w-48">
                    <div className="h-12 border-b border-black mb-1"></div>
                    <p className="font-bold uppercase">SERVICE PERFORMED BY</p>
                    <p className="uppercase">{selectedReport.mechanic}</p>
                  </div>
                  
                  <div className="border border-black text-center w-64">
                    <div className="border-b border-black p-1 font-bold text-[8px]">
                      The client was informend about the found<br/>Detect and the danger resulting therefrom
                    </div>
                    <div className="p-1 flex justify-between font-bold">
                      <div>WORKING HOURS:</div>
                      <div>DATE:</div>
                      <div>TO:</div>
                    </div>
                  </div>
                  
                  <div className="text-center w-48">
                    <div className="h-12 border-b border-black mb-1"></div>
                    <p className="font-bold uppercase">CLIENT SIGNATURE & STAMP</p>
                    <p className="uppercase mt-1 text-[7px]">NAME IN BLOCK LETTER<br/>PLEASE SUBMIT QUOTATION</p>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-4 font-bold uppercase text-[8px]">
                  {['Under Guarantee', 'To Be Charged', 'Urgently', 'Immediate'].map(flag => (
                    <div key={flag} className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center">
                        {selectedReport.additional_data?.action_flags?.includes(flag) ? 'X' : ''}
                      </div>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end bg-surface-container-lowest">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 border rounded font-medium hover:bg-surface-container-low">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

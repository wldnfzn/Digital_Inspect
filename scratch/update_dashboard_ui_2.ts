import fs from 'fs';

let content = fs.readFileSync('apps/web/src/pages/DashboardPage.tsx', 'utf8');

// Replace DashboardHeader
content = content.replace(
`const DashboardHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
    <div>
      <h2 className="font-headline-xl text-headline-xl text-on-background">{title}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{subtitle}</p>
    </div>
    <div className="flex gap-sm">
      <button className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:border-outline transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
        This Month
      </button>
      <button className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
        Export Report
      </button>
    </div>
  </div>
);`,
`const DashboardHeader = ({ title, subtitle, month, setMonth }: { title: string, subtitle: string, month?: string, setMonth?: any }) => (
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
);`
);

content = content.replace(
`const AdminDashboard = () => (
  <>
    <DashboardHeader title="Admin Overview" subtitle="System Administration" />
    <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
      <h3 className="font-headline-lg text-headline-lg">Welcome to Super Admin Dashboard</h3>
      <p className="mt-2 text-on-surface-variant">Use the sidebar to manage Users, Customers, QR Codes, and system Settings.</p>
    </div>
  </>
);`,
`const AdminDashboard = ({ stats, month, setMonth }: { stats: any, month: string, setMonth: any }) => (
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
                      <span className={\`font-bold \${asset.avg_health < 50 ? 'text-[#dc2626]' : asset.avg_health < 80 ? 'text-[#f59e0b]' : 'text-[#16a34a]'}\`}>
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
);`
);

content = content.replace(
  `export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);`,
  `export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);`
);

content = content.replace(
  `const response = await api.get('/dashboard/stats');`,
  "const response = await api.get(`/dashboard/stats${month ? '?month=' + month : ''}`);"
);

content = content.replace(
  `    fetchStats();
  }, []);`,
  `    fetchStats();
  }, [month]);`
);

content = content.replace(
  `  const renderDashboard = () => {
    if (user?.role === UserRole.DIRECTOR) return <DirectorDashboard stats={stats} />;
    if (user?.role === UserRole.SUPER_ADMIN) return <AdminDashboard />;
    return <ManagerDashboard stats={stats} openDetail={openDetail} openAllAlerts={() => setShowAllAlerts(true)} />;
  };`,
  `  const renderDashboard = () => {
    if (user?.role === UserRole.DIRECTOR) return <DirectorDashboard stats={stats} />;
    if (user?.role === UserRole.SUPER_ADMIN) return <AdminDashboard stats={stats} month={month} setMonth={setMonth} />;
    return <ManagerDashboard stats={stats} openDetail={openDetail} openAllAlerts={() => setShowAllAlerts(true)} />;
  };`
);

fs.writeFileSync('apps/web/src/pages/DashboardPage.tsx', content);

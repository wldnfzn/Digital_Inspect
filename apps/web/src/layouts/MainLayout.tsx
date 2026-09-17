import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        className={\`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all group \${
          active 
            ? 'bg-primary text-on-primary font-semibold shadow-sm' 
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-semibold'
        }\`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="font-label-lg text-label-lg">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between print:hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo Area */}
        <div className="h-16 px-gutter flex items-center gap-space-sm border-b border-outline-variant/30">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant/50">
            <span className="material-symbols-outlined text-primary text-[20px]">precision_manufacturing</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">UMP Digital Inspect</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Asset Management</span>
          </div>
        </div>

        {/* Navigation Area */}
        <div className="px-gutter pt-space-md overflow-y-auto flex-1 pb-4">
          <div className="px-space-sm py-space-xs mb-space-xs font-label-sm text-[10px] uppercase tracking-wider text-outline font-bold">Main Navigation</div>
          <nav className="space-y-space-xs mb-6">
            <NavItem to="/dashboard" icon="space_dashboard" label="Dashboard" />
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
              <NavItem to="/customers" icon="domain" label="Customers" />
            )}
            <NavItem to="/assets" icon="forklift" label="Assets" />
            <NavItem to="/inspections" icon="fact_check" label="Inspections" />
            <NavItem to="/reports" icon="description" label="Reports" />
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
              <NavItem to="/qr-codes" icon="qr_code_scanner" label="QR Codes" />
            )}
          </nav>

          {user?.role === UserRole.SUPER_ADMIN && (
            <>
              <div className="px-space-sm py-space-xs mb-space-xs font-label-sm text-[10px] uppercase tracking-wider text-outline font-bold">System Administration</div>
              <nav className="space-y-space-xs">
                <NavItem to="/users" icon="manage_accounts" label="Users" />
                <NavItem to="/audit-log" icon="history" label="Audit Log" />
                <NavItem to="/settings" icon="settings" label="Settings" />
              </nav>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Status Area */}
      <div className="p-gutter border-t border-outline-variant/30">
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs border border-outline-variant/50">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface font-semibold">Telemetry Live</span>
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
          </div>
          <span className="font-body-sm text-[11px] text-on-surface-variant">UMP Sync v2.4</span>
        </div>
      </div>
    </aside>
  );
};

const TopNavBar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(res => setNotifications(res.data.data)).catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRead = async (id: string) => {
    await api.put(\`/notifications/\${id}/read\`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 z-40 print:hidden">
      <div className="h-16 w-full px-gutter-lg flex items-center justify-between gap-space-md">
        
        {/* Search Bar Area */}
        <div className="flex items-center gap-space-md flex-1 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input 
              className="w-full bg-surface text-on-surface border border-outline-variant/40 placeholder:text-on-surface-variant pl-10 pr-space-md py-2 rounded-lg font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              placeholder="Search asset ID, serial number, or customer..." 
              type="text"
            />
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-space-md">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden z-50">
                <div className="p-3 bg-surface border-b border-outline-variant/30 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-on-surface">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm p-4 text-center text-on-surface-variant">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleRead(n.id)}
                        className={\`p-3 text-sm border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors \${!n.is_read ? 'bg-primary/5' : ''}\`}
                      >
                        <p className={\`\${!n.is_read ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}\`}>{n.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>

          {/* User Profile */}
          <div className="flex items-center gap-space-sm pl-2">
            <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="flex flex-col hidden sm:flex mr-2">
              <span className="font-label-md text-[13px] text-on-surface font-bold leading-tight">{user?.full_name}</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">{user?.role}</span>
            </div>
            
            <button onClick={logout} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors ml-1" title="Log Out">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="w-full py-md flex justify-between items-center mt-auto bg-transparent border-t border-outline-variant/30 px-margin-desktop print:hidden">
    <div className="flex items-center gap-2">
      <span className="font-body-sm text-[12px] font-medium text-on-surface-variant">PT United Multilift Perkasa</span>
      <span className="text-on-surface-variant">•</span>
      <span className="font-body-sm text-[12px] text-on-surface-variant">© 2026 UMP Digital Inspect. Industrial Compliance Engine.</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-[#dcfce7] px-2 py-1 rounded-full border border-[#bbf7d0]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
        <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider">Operational</span>
      </div>
      <span className="font-body-sm text-[11px] text-on-surface-variant font-medium">Release 4.12.0</span>
    </div>
  </footer>
);

export const MainLayout = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center">Please log in to continue. <button onClick={() => window.location.reload()} className="text-primary underline font-bold">Reload</button></div>
  }

  return (
    <div className="bg-surface min-h-screen font-body-md text-on-surface antialiased flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full min-h-screen relative print:ml-0">
        <TopNavBar />
        <main className="flex-1 pt-16 w-full flex flex-col print:pt-0">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

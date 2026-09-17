import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
    const active = isActive(to);
    return (
      <li>
        <Link 
          to={to} 
          className={`flex items-center px-md py-sm rounded-lg gap-sm transition-all duration-200 font-label-sm text-label-sm ${
            active 
              ? 'bg-primary-container text-on-primary-container scale-[0.98]' 
              : 'text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary'
          }`}
        >
          <span className="material-symbols-outlined">{icon}</span>
          {label}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Sidebar" className="bg-tertiary-container text-on-tertiary-container fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col pt-20 pb-4 px-4 docked h-full hidden md:flex">
      <div className="absolute top-0 left-0 w-full h-16 flex items-center px-4">
        <span aria-label="UMP Logo" className="material-symbols-outlined text-on-tertiary-container mr-sm">engineering</span>
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-tertiary-container">Digital Inspect</h1>
          <p className="font-label-sm text-label-sm text-on-tertiary-container opacity-80">Asset Management</p>
        </div>
      </div>
      <ul className="flex flex-col gap-sm flex-1 mt-md overflow-y-auto">
        <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
        
        {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
          <NavItem to="/customers" icon="groups" label="Customers" />
        )}
        
        <NavItem to="/assets" icon="category" label="Assets" />
        <NavItem to="/inspections" icon="fact_check" label="Inspections" />
        <NavItem to="/reports" icon="analytics" label="Reports" />
        
        {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
          <NavItem to="/qr-codes" icon="qr_code_2" label="QR Codes" />
        )}
        
        {user?.role === UserRole.SUPER_ADMIN && (
          <>
            <NavItem to="/users" icon="person" label="Users" />
            <NavItem to="/audit-log" icon="history" label="Audit Log" />
          </>
        )}
        
        {user?.role === UserRole.SUPER_ADMIN && (
          <li className="mt-auto">
            <NavItem to="/settings" icon="settings" label="Settings" />
          </li>
        )}
      </ul>
    </nav>
  );
};

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

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
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <header className="bg-surface-container-lowest text-primary fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-margin-desktop docked full-width h-16 border-b border-outline-variant flat no shadows md:ml-64">
      <div className="flex items-center flex-1 gap-md">
        <div className="relative w-64 hidden sm:block">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
          <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 focus:border-primary focus:ring-2 focus:ring-primary-container text-body-md font-body-md transition-all h-8" placeholder="Search..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-outline-variant overflow-hidden z-50">
              <div className="p-3 bg-surface-container-lowest border-b border-outline-variant">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm p-4 text-center text-on-surface-variant">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleRead(n.id)}
                      className={`p-3 text-sm border-b border-outline-variant cursor-pointer hover:bg-surface-container-low ${!n.is_read ? 'bg-primary-container/20 font-semibold' : ''}`}
                    >
                      <p>{n.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <div className="text-right hidden sm:block">
            <p className="font-label-sm text-on-background text-sm font-semibold">{user?.full_name}</p>
            <p className="text-xs text-on-surface-variant">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">person</span>
          </div>
          <button onClick={logout} className="ml-2 text-error hover:bg-error-container p-1 rounded-full flex items-center" title="Log Out">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="w-full py-md flex justify-center items-center mt-auto bg-transparent border-t border-outline-variant/30 px-margin-desktop">
    <span className="font-caption text-caption font-bold text-on-surface-variant">© 2026 PT United Multilift Perkasa</span>
  </footer>
);

export const MainLayout = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center">Please select a role to login from top right (in a real app this is the Login Page). <button onClick={() => window.location.reload()} className="text-blue-500 underline">Reload</button></div>
  }

  return (
    <>
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col md:ml-64 bg-[#f8fafc] min-h-screen relative w-full print:ml-0 print:bg-white">
        <div className="print:hidden">
          <TopNavBar />
        </div>
        <main className="flex-1 p-margin-desktop mt-16 max-w-7xl mx-auto w-full flex flex-col gap-lg print:mt-0 print:p-0">
          <Outlet />
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </>
  );
};

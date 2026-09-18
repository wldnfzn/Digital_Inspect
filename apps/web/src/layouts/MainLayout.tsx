import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
    const active = isActive(to);
    return (
      <li>
        <Link 
          to={to} 
          className={`flex items-center px-4 py-2.5 rounded-lg gap-3 transition-colors font-medium text-sm ${
            active 
              ? 'bg-primary/10 text-primary' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
          {label}
        </Link>
      </li>
    );
  };

  const sidebarClasses = `fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav aria-label="Sidebar" className={sidebarClasses}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <span aria-label="UMP Logo" className="material-symbols-outlined text-primary text-2xl">engineering</span>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Digital Inspect</h1>
              <p className="text-[11px] font-medium text-gray-500">Asset Management</p>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Menu</div>
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
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Administration</div>
              <NavItem to="/users" icon="person" label="Users" />
              <NavItem to="/audit-log" icon="history" label="Audit Log" />
              <NavItem to="/settings" icon="settings" label="Settings" />
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.role}</p>
              </div>
           </div>
        </div>
      </nav>
    </>
  );
};


const TopNavBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data.data)).catch(console.error);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <header className="bg-white fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 h-16 shadow-sm border-b border-gray-100 md:ml-64 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Search anything..." type="text"/>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors rounded-full flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-gray-100 overflow-hidden z-50 animate-fadeIn origin-top-right">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                {unreadCount > 0 && <span className="text-[11px] text-primary font-medium cursor-pointer hover:underline">Mark all read</span>}
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-sm p-6 text-center text-gray-500">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleRead(n.id)}
                      className={`p-4 text-sm border-b border-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'}`}
                    >
                      <p className={`text-gray-900 ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block mx-1"></div>

        <button onClick={logout} className="ml-1 text-gray-500 hover:text-error hover:bg-error-container p-2 rounded-full flex items-center transition-colors" title="Log Out">
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="w-full py-6 flex justify-center items-center mt-auto bg-transparent px-8">
    <span className="text-xs font-medium text-gray-400">© 2026 PT United Multilift Perkasa</span>
  </footer>
);

export const MainLayout = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
      <div className="flex-1 flex flex-col md:ml-64 bg-background min-h-screen relative w-full print:ml-0 print:bg-white transition-all">
        <div className="print:hidden">
          <TopNavBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>
        <main className="flex-1 p-4 sm:p-8 mt-16 max-w-[1440px] mx-auto w-full flex flex-col gap-6 print:mt-0 print:p-0">
          <Outlet />
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </>
  );
};

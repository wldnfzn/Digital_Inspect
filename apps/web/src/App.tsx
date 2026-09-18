import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { AssetsPage } from './pages/AssetsPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { QRCodesPage } from './pages/QRCodesPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="inspections" element={<InspectionsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="qr-codes" element={<QRCodesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

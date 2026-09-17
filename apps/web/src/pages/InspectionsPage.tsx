import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';

export const InspectionsPage = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // State for form
  const [assetType, setAssetType] = useState('FORKLIFT');
  const [assetId, setAssetId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Pre-load assets and mechanics for form
  const [forklifts, setForklifts] = useState<any[]>([]);
  const [batteries, setBatteries] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);

  const canSchedule = user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inspections/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (canSchedule) {
      api.get('/forklifts').then(res => setForklifts(res.data.data));
      api.get('/batteries').then(res => setBatteries(res.data.data));
      api.get('/users/mechanics').then(res => setMechanics(res.data.data));
    }
  }, [canSchedule]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inspections/schedule', {
        asset_type: assetType,
        forklift_id: assetType === 'FORKLIFT' ? assetId : null,
        battery_id: assetType === 'BATTERY' ? assetId : null,
        assigned_to: assignedTo,
        scheduled_date: scheduledDate
      });
      alert('Tugas inspeksi berhasil dijadwalkan!');
      setShowScheduleForm(false);
      
      // Reset form
      setAssetId('');
      setAssignedTo('');
      setScheduledDate('');
      
      fetchTasks(); // Refresh tasks
    } catch (error: any) {
      alert('Gagal: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredTasks = tasks.filter(t => {
    const code = (t.asset_type === 'FORKLIFT' ? t.forklift_code : t.battery_code) || '';
    const mechanic = t.mechanic_name || t.assigned_to || '';
    const searchLower = search.toLowerCase();
    
    const matchesSearch = code.toLowerCase().includes(searchLower) || mechanic.toLowerCase().includes(searchLower);
    const matchesType = typeFilter === 'ALL' || t.asset_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesDate = dateFilter === '' || (t.scheduled_date && t.scheduled_date.startsWith(dateFilter));
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await api.delete(`/inspections/tasks/${id}`);
      alert('Jadwal berhasil dihapus');
      fetchTasks();
    } catch (e: any) {
      alert('Gagal: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Management</h2>
          <p className="text-base text-gray-500 mt-1">View tasks and schedule new inspections</p>
        </div>
        {canSchedule && (
          <button 
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {showScheduleForm ? 'close' : 'calendar_add_on'}
            </span>
            {showScheduleForm ? 'Batal' : 'Jadwalkan Tugas'}
          </button>
        )}
      </div>

      {showScheduleForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">assignment_ind</span>
            Buat Jadwal Inspeksi Baru
          </h3>
          <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tipe Aset</label>
              <select value={assetType} onChange={e => {setAssetType(e.target.value); setAssetId('');}} className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none">
                <option value="FORKLIFT">Forklift</option>
                <option value="BATTERY">Battery</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Pilih Aset *</label>
              <select value={assetId} onChange={e => setAssetId(e.target.value)} required className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none">
                <option value="">-- Pilih --</option>
                {assetType === 'FORKLIFT' ? forklifts.map(f => (
                  <option key={f.id} value={f.id}>{f.asset_code} {f.model ? `(${f.model})` : ''}</option>
                )) : batteries.map(b => (
                  <option key={b.id} value={b.id}>{b.asset_code} {b.brand ? `(${b.brand})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tugaskan ke Mekanik *</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none">
                <option value="">-- Pilih Mekanik --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Jadwal Inspeksi *</label>
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none" />
            </div>
            
            <div className="flex flex-col justify-end">
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all h-11 cursor-pointer flex items-center justify-center gap-2"
              >
                Buat Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h3 className="font-semibold text-gray-900 hidden sm:block">Inspection Tasks</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              title="Filter by Schedule Date"
            />
            <input 
              type="text" 
              placeholder="Search code or mechanic..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="FORKLIFT">Forklift</option>
              <option value="BATTERY">Battery</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Code</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mechanic</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No tasks found matching filters</td></tr>
              ) : filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="px-4 py-3">{new Date(t.scheduled_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-primary">{t.asset_type === 'FORKLIFT' ? t.forklift_code : t.battery_code}</td>
                  <td className="px-4 py-3">{t.asset_type}</td>
                  <td className="px-4 py-3">{t.mechanic_name || t.assigned_to}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      t.status === 'COMPLETED' ? 'bg-success-container text-on-success-container border-success/20' : 
                      t.status === 'SCHEDULED' ? 'bg-primary-container text-on-primary-container border-primary/20' : 
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canSchedule && (
                      <button 
                        className="text-error hover:underline text-sm font-medium cursor-pointer"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';

export const InspectionsPage = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
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

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-background">Inspection Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">View tasks and schedule new inspections</p>
        </div>
        {canSchedule && (
          <button 
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {showScheduleForm ? 'close' : 'calendar_add_on'}
            </span>
            {showScheduleForm ? 'Batal' : 'Jadwalkan Tugas'}
          </button>
        )}
      </div>

      {showScheduleForm && (
        <div className="mt-md bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-sm">
          <h3 className="font-headline-lg text-primary mb-sm flex items-center gap-2">
            <span className="material-symbols-outlined">assignment_ind</span>
            Buat Jadwal Inspeksi Baru
          </h3>
          <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md mt-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Tipe Aset</label>
              <select value={assetType} onChange={e => {setAssetType(e.target.value); setAssetId('');}} className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary">
                <option value="FORKLIFT">Forklift</option>
                <option value="BATTERY">Battery</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Pilih Aset *</label>
              <select value={assetId} onChange={e => setAssetId(e.target.value)} required className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary">
                <option value="">-- Pilih --</option>
                {assetType === 'FORKLIFT' ? forklifts.map(f => (
                  <option key={f.id} value={f.id}>{f.asset_code} {f.model ? `(${f.model})` : ''}</option>
                )) : batteries.map(b => (
                  <option key={b.id} value={b.id}>{b.asset_code} {b.brand ? `(${b.brand})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Tugaskan ke Mekanik *</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary">
                <option value="">-- Pilih Mekanik --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Jadwal Inspeksi *</label>
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary" />
            </div>
            
            <div className="flex flex-col justify-end">
              <button 
                type="submit" 
                className="bg-primary text-on-primary py-2 rounded text-sm font-bold hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
              >
                Buat Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-semibold">Inspection Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Date</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Asset Code</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Type</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Mechanic</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">No tasks found</td></tr>
              ) : tasks.map(t => (
                <tr key={t.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                  <td className="p-sm pl-md">{new Date(t.scheduled_date).toLocaleDateString()}</td>
                  <td className="p-sm font-medium text-primary">{t.asset_type === 'FORKLIFT' ? t.forklift_code : t.battery_code}</td>
                  <td className="p-sm">{t.asset_type}</td>
                  <td className="p-sm">{t.mechanic_name || t.assigned_to}</td>
                  <td className="p-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      t.status === 'COMPLETED' ? 'bg-[#dcfce7] text-[#166534]' : 
                      t.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}>
                      {t.status}
                    </span>
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

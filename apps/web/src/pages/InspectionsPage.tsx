import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast, ConfirmDialog } from '../components/ui';

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

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast('Tugas inspeksi berhasil dijadwalkan!', 'success');
      setShowScheduleForm(false);
      
      // Reset form
      setAssetId('');
      setAssignedTo('');
      setScheduledDate('');
      
      fetchTasks(); // Refresh tasks
    } catch (error: any) {
      toast('Gagal: ' + (error.response?.data?.error || error.message), 'error');
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
    try {
      await api.delete(`/inspections/tasks/${id}`);
      toast('Jadwal berhasil dihapus', 'success');
      fetchTasks();
    } catch (e: any) {
      toast('Gagal: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setDeleteTarget(null);
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
          <Button 
            variant="primary" 
            icon={showScheduleForm ? 'close' : 'calendar_add_on'}
            onClick={() => setShowScheduleForm(!showScheduleForm)}
          >
            {showScheduleForm ? 'Batal' : 'Jadwalkan Tugas'}
          </Button>
        )}
      </div>

      {showScheduleForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">assignment_ind</span>
            Buat Jadwal Inspeksi Baru
          </h3>
          <form onSubmit={handleSchedule}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select label="Tipe Aset" value={assetType} onChange={e => {setAssetType(e.target.value); setAssetId('');}}>
                <option value="FORKLIFT">Forklift</option>
                <option value="BATTERY">Battery</option>
              </Select>
              
              <Select label="Pilih Aset *" value={assetId} onChange={e => setAssetId(e.target.value)} required>
                <option value="">-- Pilih --</option>
                {assetType === 'FORKLIFT' ? forklifts.map(f => (
                  <option key={f.id} value={f.id}>{f.asset_code} {f.model ? `(${f.model})` : ''}</option>
                )) : batteries.map(b => (
                  <option key={b.id} value={b.id}>{b.asset_code} {b.brand ? `(${b.brand})` : ''}</option>
                ))}
              </Select>
              
              <Select label="Tugaskan ke Mekanik *" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                <option value="">-- Pilih Mekanik --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </Select>
              
              <Input type="date" label="Jadwal Inspeksi *" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required />
            </div>
            
            <Button variant="primary" type="submit" className="w-full">
              Buat Tugas
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h3 className="font-semibold text-gray-900 hidden sm:block">Inspection Tasks</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              title="Filter by Schedule Date"
            />
            <Input 
              placeholder="Search code or mechanic..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="FORKLIFT">Forklift</option>
              <option value="BATTERY">Battery</option>
            </Select>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Code</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mechanic</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-3.5 text-center text-gray-500">Loading...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-3.5 text-center text-gray-500">No tasks found matching filters</td></tr>
              ) : filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="px-5 py-3.5">{new Date(t.scheduled_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 font-medium text-primary">{t.asset_type === 'FORKLIFT' ? t.forklift_code : t.battery_code}</td>
                  <td className="px-5 py-3.5">{t.asset_type}</td>
                  <td className="px-5 py-3.5">{t.mechanic_name || t.assigned_to}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={t.status === 'COMPLETED' ? 'completed' : t.status === 'SCHEDULED' ? 'scheduled' : 'info'}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {canSchedule && (
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(t.id)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Schedule"
        message="Hapus jadwal ini?"
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

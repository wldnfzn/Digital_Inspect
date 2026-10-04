import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '@digital-inspect/shared';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast } from '../components/ui';

export const TicketsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    asset_type: 'FORKLIFT',
    forklift_id: '',
    battery_id: '',
    issue_type: 'KELUHAN_SERVICE',
    issue_description: '',
    sales_notes: ''
  });
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);

  useEffect(() => {
    fetchTickets();
    if (user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) {
      api.get('/customers').then(res => setCustomers(res.data.data));
    }
    if (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) {
      api.get('/users').then(res => setMechanics(res.data.data.filter((u:any) => u.role === UserRole.MECHANIC)));
    }
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      const endpoint = formData.asset_type === 'FORKLIFT' ? '/forklifts' : '/batteries';
      api.get(endpoint).then(res => {
        setAssets(res.data.data.filter((a:any) => a.customer_id === formData.customer_id));
      });
    } else {
      setAssets([]);
    }
  }, [formData.customer_id, formData.asset_type]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets', formData);
      setShowForm(false);
      fetchTickets();
      toast('Berhasil membuat tiket!', 'success');
      setFormData({
        customer_id: '', asset_type: 'FORKLIFT', forklift_id: '', battery_id: '', issue_type: 'KELUHAN_SERVICE', issue_description: '', sales_notes: ''
      });
    } catch (error) {
      toast('Gagal membuat tiket', 'error');
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.post(`/tickets/${id}/submit`);
      toast('Berhasil submit tiket!', 'success');
      fetchTickets();
    } catch (e) {
      toast('Gagal submit tiket', 'error');
    }
  };

  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [assignData, setAssignData] = useState({ mechanic_id: '', leader_notes: '' });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/tickets/${assigningTicket}/assign`, assignData);
      setAssigningTicket(null);
      toast('Berhasil menugaskan mekanik!', 'success');
      fetchTickets();
    } catch (e) {
      toast('Gagal menugaskan tiket', 'error');
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      case 'SUBMITTED': return <Badge variant="warning">Submitted</Badge>;
      case 'ASSIGNED': return <Badge variant="info">Assigned</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="error">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Tiket Order</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola keluhan service dan inspeksi dadakan dari pelanggan</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN) && (
            <Button variant="primary" icon="add" onClick={() => setShowForm(true)}>
              Buat Tiket Baru
            </Button>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <Modal.Header onClose={() => setShowForm(false)}>Buat Tiket Baru</Modal.Header>
        <Modal.Body>
          <form id="ticket-form" onSubmit={handleCreate} className="space-y-4">
            <Select label="Customer *" required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
              <option value="">Pilih Customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Tipe Aset *" value={formData.asset_type} onChange={e => setFormData({...formData, asset_type: e.target.value as any, forklift_id: '', battery_id: ''})}>
                <option value="FORKLIFT">Forklift</option>
                <option value="BATTERY">Battery</option>
              </Select>

              <Select label={`Pilih ${formData.asset_type === 'FORKLIFT' ? 'Forklift' : 'Battery'} *`} required value={formData.asset_type === 'FORKLIFT' ? formData.forklift_id : formData.battery_id} onChange={e => formData.asset_type === 'FORKLIFT' ? setFormData({...formData, forklift_id: e.target.value}) : setFormData({...formData, battery_id: e.target.value})}>
                <option value="">Pilih Aset...</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.asset_code}</option>)}
              </Select>
            </div>

            <Select label="Tipe Keluhan *" value={formData.issue_type} onChange={e => setFormData({...formData, issue_type: e.target.value as any})}>
              <option value="KELUHAN_SERVICE">Keluhan Service</option>
              <option value="INSPEKSI_DADAKAN">Inspeksi Dadakan</option>
            </Select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Keluhan *</label>
              <textarea required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border" rows={3} value={formData.issue_description} onChange={e => setFormData({...formData, issue_description: e.target.value})}></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Sales (Opsional)</label>
              <textarea className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border" rows={2} value={formData.sales_notes} onChange={e => setFormData({...formData, sales_notes: e.target.value})}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
          <Button variant="primary" type="submit" form="ticket-form">Simpan Draft</Button>
        </Modal.Footer>
      </Modal>

      <Modal open={!!assigningTicket} onClose={() => setAssigningTicket(null)}>
        <Modal.Header onClose={() => setAssigningTicket(null)}>Tugaskan Mekanik</Modal.Header>
        <Modal.Body>
          <form id="assign-form" onSubmit={handleAssign} className="space-y-4">
            <Select label="Pilih Mekanik *" required value={assignData.mechanic_id} onChange={e => setAssignData({...assignData, mechanic_id: e.target.value})}>
              <option value="">Pilih mekanik...</option>
              {mechanics.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </Select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Leader (Instruksi)</label>
              <textarea className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border" rows={3} value={assignData.leader_notes} onChange={e => setAssignData({...assignData, leader_notes: e.target.value})}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAssigningTicket(null)}>Batal</Button>
          <Button variant="primary" type="submit" form="assign-form">Tugaskan</Button>
        </Modal.Footer>
      </Modal>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Tiket</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer & Asset</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keluhan</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mekanik</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{t.ticket_code}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 text-sm">{t.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.forklift_code || t.battery_code} ({t.asset_type})</div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-sm text-gray-900">{t.issue_type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate" title={t.issue_description}>{t.issue_description}</div>
                    </td>
                    <td className="px-5 py-4">{renderStatus(t.status)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{t.mechanic_name || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {t.status === 'DRAFT' && (user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN) && (
                          <Button variant="ghost" size="sm" icon="send" onClick={() => handleSubmit(t.id)}>Submit</Button>
                        )}
                        {t.status === 'SUBMITTED' && (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
                          <Button variant="ghost" size="sm" icon="assignment_ind" onClick={() => setAssigningTicket(t.id)}>Assign</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">Belum ada data tiket order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../AuthContext';
import { UserRole, ServiceTicket } from '@digital-inspect/shared';

export const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for Sales
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

  // Reference data
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
      api.get(`/assets?customer_id=${formData.customer_id}&type=${formData.asset_type}`).then(res => setAssets(res.data.data));
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
      setFormData({
        customer_id: '', asset_type: 'FORKLIFT', forklift_id: '', battery_id: '', issue_type: 'KELUHAN_SERVICE', issue_description: '', sales_notes: ''
      });
    } catch (error) {
      alert('Failed to create ticket');
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.post(`/tickets/${id}/submit`);
      fetchTickets();
    } catch (e) {
      alert('Failed to submit ticket');
    }
  };

  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [assignData, setAssignData] = useState({ mechanic_id: '', leader_notes: '' });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/tickets/${assigningTicket}/assign`, assignData);
      setAssigningTicket(null);
      fetchTickets();
    } catch (e) {
      alert('Failed to assign ticket');
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      case 'SUBMITTED': return <Badge variant="warning">Submitted</Badge>;
      case 'ASSIGNED': return <Badge variant="info">Assigned</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Tiket Order</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola keluhan service dan inspeksi dadakan</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN) && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Tiket
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Buat Tiket Baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <select className="input-field" required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                  <option value="">Pilih Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Aset</label>
                <select className="input-field" value={formData.asset_type} onChange={e => setFormData({...formData, asset_type: e.target.value as any, forklift_id: '', battery_id: ''})}>
                  <option value="FORKLIFT">Forklift</option>
                  <option value="BATTERY">Battery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Pilih {formData.asset_type === 'FORKLIFT' ? 'Forklift' : 'Battery'}</label>
                <select className="input-field" required 
                  value={formData.asset_type === 'FORKLIFT' ? formData.forklift_id : formData.battery_id} 
                  onChange={e => formData.asset_type === 'FORKLIFT' ? setFormData({...formData, forklift_id: e.target.value}) : setFormData({...formData, battery_id: e.target.value})}
                >
                  <option value="">Pilih Aset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.asset_code}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Keluhan</label>
                <select className="input-field" value={formData.issue_type} onChange={e => setFormData({...formData, issue_type: e.target.value as any})}>
                  <option value="KELUHAN_SERVICE">Keluhan Service</option>
                  <option value="INSPEKSI_DADAKAN">Inspeksi Dadakan</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi Keluhan</label>
              <textarea required className="input-field h-24" value={formData.issue_description} onChange={e => setFormData({...formData, issue_description: e.target.value})}></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Catatan Sales (Opsional)</label>
              <textarea className="input-field h-16" value={formData.sales_notes} onChange={e => setFormData({...formData, sales_notes: e.target.value})}></textarea>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan Draft</button>
            </div>
          </form>
        </div>
      )}

      {assigningTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Tugaskan ke Mekanik</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pilih Mekanik</label>
                <select required className="input-field" value={assignData.mechanic_id} onChange={e => setAssignData({...assignData, mechanic_id: e.target.value})}>
                  <option value="">Pilih mekanik...</option>
                  {mechanics.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan Leader</label>
                <textarea className="input-field h-24" value={assignData.leader_notes} onChange={e => setAssignData({...assignData, leader_notes: e.target.value})}></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setAssigningTicket(null)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Tugaskan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Kode Tiket</th>
                  <th className="px-4 py-3">Customer & Asset</th>
                  <th className="px-4 py-3">Keluhan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Mekanik</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{t.ticket_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{t.customer_name}</div>
                      <div className="text-xs text-gray-500">{t.forklift_code || t.battery_code} ({t.asset_type})</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium">{t.issue_type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500 truncate">{t.issue_description}</div>
                    </td>
                    <td className="px-4 py-3">{renderStatus(t.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{t.mechanic_name || '-'}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {t.status === 'DRAFT' && (user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN) && (
                        <button onClick={() => handleSubmit(t.id)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                          Submit
                        </button>
                      )}
                      {t.status === 'SUBMITTED' && (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
                        <button onClick={() => setAssigningTicket(t.id)} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100">
                          Tugaskan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada tiket order</td>
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

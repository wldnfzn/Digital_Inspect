import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../AuthContext';
import { UserRole, SparepartRequest } from '@digital-inspect/shared';

export const SparepartRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SparepartRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    asset_type: 'FORKLIFT',
    forklift_id: '',
    battery_id: '',
    ticket_id: '',
    urgency: 'NORMAL',
    leader_notes: '',
    items: [{ part_name: '', quantity: 1 }]
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
    if (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) {
      api.get('/customers').then(res => setCustomers(res.data.data));
      api.get('/tickets').then(res => setTickets(res.data.data.filter((t:any) => t.status !== 'COMPLETED')));
    }
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      api.get(`/assets?customer_id=${formData.customer_id}&type=${formData.asset_type}`).then(res => setAssets(res.data.data));
    } else {
      setAssets([]);
    }
  }, [formData.customer_id, formData.asset_type]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/spareparts');
      setRequests(res.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/spareparts', formData);
      setShowForm(false);
      fetchRequests();
      setFormData({
        customer_id: '', asset_type: 'FORKLIFT', forklift_id: '', battery_id: '', ticket_id: '', urgency: 'NORMAL', leader_notes: '', items: [{ part_name: '', quantity: 1 }]
      });
    } catch (error) {
      alert('Failed to create request');
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.post(`/spareparts/${id}/submit`);
      fetchRequests();
    } catch (e) {
      alert('Failed to submit');
    }
  };

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processData, setProcessData] = useState({ status: 'PROCESSING', inventory_notes: '' });

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/spareparts/${processingId}/process`, processData);
      setProcessingId(null);
      fetchRequests();
    } catch (e) {
      alert('Failed to process');
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      case 'SUBMITTED': return <Badge variant="warning">Submitted</Badge>;
      case 'PROCESSING': return <Badge variant="info">Processing</Badge>;
      case 'READY': return <Badge variant="success">Ready</Badge>;
      case 'REJECTED': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Pengadaan Spare Part</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola permintaan spare part untuk service</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Permintaan
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Buat Permintaan Spare Part</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiket Terkait (Opsional)</label>
                <select className="input-field" value={formData.ticket_id} onChange={e => {
                  const tId = e.target.value;
                  setFormData({...formData, ticket_id: tId});
                  const t = tickets.find(x => x.id === tId);
                  if (t) {
                    setFormData(prev => ({...prev, customer_id: t.customer_id, asset_type: t.asset_type, forklift_id: t.forklift_id || '', battery_id: t.battery_id || ''}));
                  }
                }}>
                  <option value="">Pilih Tiket...</option>
                  {tickets.map(t => <option key={t.id} value={t.id}>{t.ticket_code}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgensi</label>
                <select className="input-field" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value as any})}>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Customer (Opsional)</label>
                <select className="input-field" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                  <option value="">Pilih Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Aset (Opsional)</label>
                <select className="input-field" value={formData.asset_type === 'FORKLIFT' ? formData.forklift_id : formData.battery_id} 
                  onChange={e => formData.asset_type === 'FORKLIFT' ? setFormData({...formData, forklift_id: e.target.value}) : setFormData({...formData, battery_id: e.target.value})}
                >
                  <option value="">Pilih Aset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.asset_code}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Daftar Barang</label>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input required placeholder="Nama part" className="input-field flex-1" value={item.part_name} onChange={e => {
                    const newItems = [...formData.items]; newItems[idx].part_name = e.target.value; setFormData({...formData, items: newItems});
                  }}/>
                  <input type="number" min="1" className="input-field w-24" value={item.quantity} onChange={e => {
                    const newItems = [...formData.items]; newItems[idx].quantity = parseInt(e.target.value); setFormData({...formData, items: newItems});
                  }}/>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => {
                      const newItems = formData.items.filter((_, i) => i !== idx); setFormData({...formData, items: newItems});
                    }} className="text-error px-2"><span className="material-symbols-outlined">delete</span></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFormData({...formData, items: [...formData.items, { part_name: '', quantity: 1 }]})} className="text-sm text-primary font-medium hover:underline">+ Tambah Barang</button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Catatan</label>
              <textarea className="input-field h-16" value={formData.leader_notes} onChange={e => setFormData({...formData, leader_notes: e.target.value})}></textarea>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan Draft</button>
            </div>
          </form>
        </div>
      )}

      {processingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Proses Permintaan</h2>
            <form onSubmit={handleProcess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status Ketersediaan</label>
                <select className="input-field" value={processData.status} onChange={e => setProcessData({...processData, status: e.target.value})}>
                  <option value="PROCESSING">Sedang Diproses (Cek Stok)</option>
                  <option value="READY">Barang Tersedia (Siap Diambil)</option>
                  <option value="REJECTED">Ditolak / Stok Kosong</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan Inventory</label>
                <textarea className="input-field h-24" value={processData.inventory_notes} onChange={e => setProcessData({...processData, inventory_notes: e.target.value})}></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setProcessingId(null)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Simpan Status</button>
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
                  <th className="px-4 py-3">Kode Request</th>
                  <th className="px-4 py-3">Barang Diminta</th>
                  <th className="px-4 py-3">Urgensi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.request_code}</div>
                      {r.ticket_code && <div className="text-xs text-blue-600">{r.ticket_code}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="list-disc list-inside text-xs">
                        {r.items?.map((it:any) => <li key={it.id}>{it.quantity}x {it.part_name}</li>)}
                      </ul>
                    </td>
                    <td className="px-4 py-3">
                      {r.urgency === 'URGENT' ? <Badge variant="error">Urgent</Badge> : <Badge variant="outline">Normal</Badge>}
                    </td>
                    <td className="px-4 py-3">{renderStatus(r.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      L: {r.leader_notes || '-'} <br/>
                      I: {r.inventory_notes || '-'}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {r.status === 'DRAFT' && (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
                        <button onClick={() => handleSubmit(r.id)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                          Kirim ke Tech
                        </button>
                      )}
                      {(r.status === 'SUBMITTED' || r.status === 'PROCESSING') && (user?.role === UserRole.TECH_INVENTORY || user?.role === UserRole.SUPER_ADMIN) && (
                        <button onClick={() => setProcessingId(r.id)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">
                          Proses Stok
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada permintaan spare part</td>
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

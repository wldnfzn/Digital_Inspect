import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '@digital-inspect/shared';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast } from '../components/ui';

export const SparepartRequestsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    asset_type: 'FORKLIFT',
    forklift_id: '',
    battery_id: '',
    ticket_id: '',
    urgency: 'NORMAL',
    leader_notes: ''
  });
  const [items, setItems] = useState([{ part_name: '', part_number: '', quantity: 1 }]);
  
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
      const endpoint = formData.asset_type === 'FORKLIFT' ? '/forklifts' : '/batteries';
      api.get(endpoint).then(res => {
        setAssets(res.data.data.filter((a:any) => a.customer_id === formData.customer_id));
      });
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
      await api.post('/spareparts', { ...formData, items });
      setShowForm(false);
      toast('Berhasil membuat form pengadaan sparepart!', 'success');
      fetchRequests();
      setFormData({
        customer_id: '', asset_type: 'FORKLIFT', forklift_id: '', battery_id: '', ticket_id: '', urgency: 'NORMAL', leader_notes: ''
      });
      setItems([{ part_name: '', part_number: '', quantity: 1 }]);
    } catch (error) {
      toast('Gagal membuat pengadaan', 'error');
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.post(`/spareparts/${id}/submit`);
      toast('Berhasil mengirim permintaan!', 'success');
      fetchRequests();
    } catch (e) {
      toast('Gagal mengirim permintaan', 'error');
    }
  };
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inventoryNotes, setInventoryNotes] = useState('');

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/spareparts/${processingId}/process`, { inventory_notes: inventoryNotes });
      setProcessingId(null);
      toast('Status pengadaan diproses!', 'success');
      fetchRequests();
    } catch (e) {
      toast('Gagal memproses', 'error');
    }
  };

  const handleReady = async (id: string) => {
    try {
      await api.post(`/spareparts/${id}/ready`);
      toast('Sparepart sudah siap!', 'success');
      fetchRequests();
    } catch (e) {
      toast('Gagal mengubah status', 'error');
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
          <h1 className="text-2xl font-bold text-gray-900">Pengadaan Sparepart</h1>
          <p className="text-sm text-gray-500 mt-1">Permintaan sparepart dari Customer Care Leader ke Inventory</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
            <Button variant="primary" icon="add_shopping_cart" onClick={() => setShowForm(true)}>
              Request Sparepart
            </Button>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <Modal.Header onClose={() => setShowForm(false)}>Buat Permintaan Sparepart</Modal.Header>
        <Modal.Body>
          <form id="sparepart-form" onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Tingkat Urgensi" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value as any})}>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent (Segera)</option>
              </Select>
              
              <Select label="Kaitkan dengan Tiket (Opsional)" value={formData.ticket_id} onChange={e => setFormData({...formData, ticket_id: e.target.value})}>
                <option value="">Tanpa Tiket</option>
                {tickets.map(t => <option key={t.id} value={t.id}>{t.ticket_code} - {t.customer_name}</option>)}
              </Select>
            </div>

            {!formData.ticket_id && (
              <div className="grid grid-cols-2 gap-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div className="col-span-2">
                  <Select label="Customer *" required={!formData.ticket_id} value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                    <option value="">Pilih Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
                
                <Select label="Tipe Aset" value={formData.asset_type} onChange={e => setFormData({...formData, asset_type: e.target.value as any, forklift_id: '', battery_id: ''})}>
                  <option value="FORKLIFT">Forklift</option>
                  <option value="BATTERY">Battery</option>
                </Select>
                
                <Select label={`Pilih ${formData.asset_type === 'FORKLIFT' ? 'Forklift' : 'Battery'} *`} required={!formData.ticket_id} 
                  value={formData.asset_type === 'FORKLIFT' ? formData.forklift_id : formData.battery_id} 
                  onChange={e => formData.asset_type === 'FORKLIFT' ? setFormData({...formData, forklift_id: e.target.value}) : setFormData({...formData, battery_id: e.target.value})}
                >
                  <option value="">Pilih Aset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.asset_code}</option>)}
                </Select>
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Daftar Item Sparepart *</label>
                <Button variant="ghost" size="sm" type="button" icon="add" onClick={() => setItems([...items, { part_name: '', part_number: '', quantity: 1 }])}>
                  Tambah Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start border border-gray-200 p-3 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input placeholder="Nama Sparepart" required value={item.part_name} onChange={e => {
                        const newItems = [...items];
                        newItems[index].part_name = e.target.value;
                        setItems(newItems);
                      }} />
                      <Input placeholder="Part Number (Opsional)" value={item.part_number} onChange={e => {
                        const newItems = [...items];
                        newItems[index].part_number = e.target.value;
                        setItems(newItems);
                      }} />
                    </div>
                    <div className="w-24">
                      <Input type="number" min="1" required value={item.quantity} onChange={e => {
                        const newItems = [...items];
                        newItems[index].quantity = parseInt(e.target.value);
                        setItems(newItems);
                      }} />
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border" rows={2} value={formData.leader_notes} onChange={e => setFormData({...formData, leader_notes: e.target.value})}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
          <Button variant="primary" type="submit" form="sparepart-form">Simpan Draft</Button>
        </Modal.Footer>
      </Modal>

      <Modal open={!!processingId} onClose={() => setProcessingId(null)}>
        <Modal.Header onClose={() => setProcessingId(null)}>Proses Sparepart</Modal.Header>
        <Modal.Body>
          <form id="process-form" onSubmit={handleProcess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Inventory (Estimasi ketersediaan dll)</label>
              <textarea className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border" rows={3} value={inventoryNotes} onChange={e => setInventoryNotes(e.target.value)}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProcessingId(null)}>Batal</Button>
          <Button variant="primary" type="submit" form="process-form">Set Status: Processing</Button>
        </Modal.Footer>
      </Modal>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Req</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Urgensi</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{r.request_code}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 text-sm">{r.ticket_code ? `Tiket: ${r.ticket_code}` : r.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{r.ticket_code ? 'Berdasarkan Order' : `${r.forklift_code || r.battery_code} (${r.asset_type})`}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {renderStatus(r.status)}
                        {r.urgency === 'URGENT' && <Badge variant="error">Urgent</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {r.items?.map((item:any) => (
                          <li key={item.id}>{item.quantity}x {item.part_name}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {r.status === 'DRAFT' && (user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN) && (
                          <Button variant="ghost" size="sm" icon="send" onClick={() => handleSubmit(r.id)}>Kirim</Button>
                        )}
                        {r.status === 'SUBMITTED' && (user?.role === UserRole.TECH_INVENTORY || user?.role === UserRole.SUPER_ADMIN) && (
                          <Button variant="ghost" size="sm" icon="inventory" onClick={() => setProcessingId(r.id)}>Proses</Button>
                        )}
                        {r.status === 'PROCESSING' && (user?.role === UserRole.TECH_INVENTORY || user?.role === UserRole.SUPER_ADMIN) && (
                          <Button variant="ghost" size="sm" icon="check_circle" onClick={() => handleReady(r.id)}>Selesai</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">Belum ada data pengadaan sparepart.</td>
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

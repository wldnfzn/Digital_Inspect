import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast, ConfirmDialog } from '../components/ui';

export const AssetsPage = () => {
  const [tab, setTab] = useState<'forklift' | 'battery'>('forklift');
  const { user } = useAuth();
  const canEdit = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [customers, setCustomers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ asset_code: '', model: '', year: '', brand: '', type: '', voltage: '', customer_id: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    const endpoint = tab === 'forklift' ? '/forklifts' : '/batteries';
    api.get(endpoint)
      .then(res => setItems(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    if (canEdit && customers.length === 0) {
      api.get('/customers').then(res => setCustomers(res.data.data)).catch(console.error);
    }
  }, [tab]);

  const openAddModal = () => {
    setFormData({ asset_code: '', model: '', year: '', brand: '', type: '', voltage: '', customer_id: '' });
    setModalMode('add');
    setSelectedId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setFormData({ 
      asset_code: item.asset_code || '', 
      model: item.model || '', 
      year: item.year || '',
      brand: item.brand || '', 
      type: item.type || '',
      voltage: item.voltage || '', 
      customer_id: item.customer_id || '' 
    });
    setModalMode('edit');
    setSelectedId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const endpoint = tab === 'forklift' ? '/forklifts' : '/batteries';
      await api.delete(`${endpoint}/${id}`);
      fetchItems();
      toast(`${tab} deleted successfully`, 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || `Failed to delete ${tab}`, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const endpoint = tab === 'forklift' ? '/forklifts' : '/batteries';
    
    // Clean up payload based on type
    const payload: any = { 
      asset_code: formData.asset_code, 
      customer_id: formData.customer_id || null 
    };
    
    if (tab === 'forklift') {
      payload.model = formData.model;
      payload.year = formData.year;
    } else {
      payload.brand = formData.brand;
      payload.voltage = formData.voltage ? parseFloat(formData.voltage) : null;
    }

    try {
      if (modalMode === 'add') {
        await api.post(endpoint, payload);
      } else {
        await api.put(`${endpoint}/${selectedId}`, payload);
      }
      setIsModalOpen(false);
      fetchItems();
      toast(`${tab} saved successfully`, 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || `Failed to save ${tab}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.asset_code.toLowerCase().includes(search.toLowerCase()) || 
    (item.model && item.model.toLowerCase().includes(search.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
    (item.customer_name && item.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
          <p className="text-base text-gray-500 mt-1">Manage Forklifts and Batteries</p>
        </div>
        {canEdit && (
          <Button variant="primary" icon="add" onClick={openAddModal}>
            Add {tab === 'forklift' ? 'Forklift' : 'Battery'}
          </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200 gap-8 mt-6">
        <button 
          className={`pb-3 text-sm transition-colors cursor-pointer flex items-center gap-2 text-lg ${tab === 'forklift' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
          onClick={() => { setSearch(''); setTab('forklift'); }}
        >
          <span className="material-symbols-outlined">forklift</span>
          <span className="text-sm">Forklifts</span>
        </button>
        <button 
          className={`pb-3 text-sm transition-colors cursor-pointer flex items-center gap-2 text-lg ${tab === 'battery' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
          onClick={() => { setSearch(''); setTab('battery'); }}
        >
          <span className="material-symbols-outlined">battery_charging_full</span>
          <span className="text-sm">Batteries</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row gap-4">
          <Input 
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}s...`} 
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Code</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tab === 'forklift' ? 'Model' : 'Brand'}</th>
                {tab === 'forklift' && <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>}
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tab === 'forklift' ? 'Health Score' : 'Voltage'}</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="px-5 py-3.5 text-center text-gray-500">Loading {tab}s...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="px-5 py-3.5 text-center text-gray-500">No {tab}s found</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="px-5 py-3.5 font-medium text-primary">{item.asset_code}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {tab === 'forklift' ? (item.model || '-') : (item.brand || '-')}
                  </td>
                  {tab === 'forklift' && <td className="px-5 py-3.5 text-gray-600">{item.year || '-'}</td>}
                  <td className="px-5 py-3.5 text-gray-600">{item.customer_name || '-'}</td>
                  <td className="px-5 py-3.5">
                    {tab === 'forklift' ? (
                      <Badge 
                        variant={item.health_status === 'CRITICAL' ? 'critical' : item.health_status === 'ATTENTION' ? 'attention' : 'healthy'}
                        dot
                      >
                        {item.health_score || 100}%
                      </Badge>
                    ) : (
                      <span className="text-gray-600 font-medium">{item.voltage ? `${item.voltage}V` : '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {canEdit && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(item.id)}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          <span className="capitalize">{modalMode === 'add' ? `Add New ${tab}` : `Edit ${tab}`}</span>
        </Modal.Header>
        <Modal.Body>
          <form id="asset-form" onSubmit={handleSave} className="space-y-4">
            <Input 
              label="Asset Code *"
              required
              value={formData.asset_code}
              onChange={e => setFormData({...formData, asset_code: e.target.value})}
              placeholder="e.g. FL-001"
            />
            {tab === 'forklift' ? (
              <>
                <Input 
                  label="Model"
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                  placeholder="e.g. Toyota 8FD"
                />
                <Input 
                  label="Year"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                  placeholder="e.g. 2021"
                />
              </>
            ) : (
              <>
                <Input 
                  label="Brand"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                />
                <Input 
                  label="Voltage (V)"
                  value={formData.voltage}
                  onChange={e => setFormData({...formData, voltage: e.target.value})}
                />
              </>
            )}

            <Select
              label="Assign to Customer"
              value={formData.customer_id}
              onChange={e => setFormData({...formData, customer_id: e.target.value})}
            >
              <option value="">-- No Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="asset-form" loading={isSaving}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog 
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title={`Delete ${tab}`}
        message={`Are you sure you want to delete this ${tab}?`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

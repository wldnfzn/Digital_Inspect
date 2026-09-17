import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';

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
  const [formData, setFormData] = useState({ asset_code: '', model: '', brand: '', voltage: '', customer_id: '' });
  const [isSaving, setIsSaving] = useState(false);

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
    if (!confirm(`Are you sure you want to delete this ${tab}?`)) return;
    try {
      const endpoint = tab === 'forklift' ? '/forklifts' : '/batteries';
      await api.delete(`${endpoint}/${id}`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to delete ${tab}`);
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
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to save ${tab}`);
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
    <div className="w-full flex flex-col p-gutter-lg space-y-gutter-lg max-w-[1600px] mx-auto print:p-0 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Asset Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage Forklifts and Batteries</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add {tab === 'forklift' ? 'Forklift' : 'Battery'}
          </button>
        )}
      </div>

      <div className="flex border-b border-outline-variant gap-lg mt-md">
        <button 
          className={`pb-sm font-label-sm text-label-sm transition-colors cursor-pointer ${tab === 'forklift' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => { setSearch(''); setTab('forklift'); }}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>forklift</span>
          Forklifts
        </button>
        <button 
          className={`pb-sm font-label-sm text-label-sm transition-colors cursor-pointer ${tab === 'battery' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => { setSearch(''); setTab('battery'); }}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>battery_charging_full</span>
          Batteries
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md shadow-sm">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div className="relative w-64 hidden sm:block">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-body-md h-8 outline-none focus:border-primary" 
              placeholder={`Search ${tab}s...`} 
              type="text"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Asset Code</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">{tab === 'forklift' ? 'Model' : 'Brand'}</th>
                {tab === 'forklift' && <th className="p-sm font-label-sm text-label-sm font-semibold">Year</th>}
                <th className="p-sm font-label-sm text-label-sm font-semibold">Customer</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">{tab === 'forklift' ? 'Health Score' : 'Voltage'}</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="p-8 text-center">Loading {tab}s...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="p-8 text-center">No {tab}s found</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                  <td className="p-sm pl-md font-asset-id text-asset-id font-medium text-primary">{item.asset_code}</td>
                  <td className="p-sm text-on-surface-variant">
                    {tab === 'forklift' ? (item.model || '-') : (item.brand || '-')}
                  </td>
                  {tab === 'forklift' && <td className="p-sm text-on-surface-variant">{item.year || '-'}</td>}
                  <td className="p-sm text-on-surface-variant">{item.customer_name || '-'}</td>
                  <td className="p-sm">
                    {tab === 'forklift' ? (
                      <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm border ${
                        item.health_status === 'CRITICAL' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' :
                        item.health_status === 'ATTENTION' ? 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]' :
                        'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.health_status === 'CRITICAL' ? 'bg-[#dc2626]' :
                          item.health_status === 'ATTENTION' ? 'bg-[#f59e0b]' :
                          'bg-[#16a34a]'
                        }`}></span> {item.health_score || 100}%
                      </span>
                    ) : (
                      <span className="text-on-surface-variant font-medium">{item.voltage ? `${item.voltage}V` : '-'}</span>
                    )}
                  </td>
                  <td className="p-sm pr-md">
                    {canEdit && (
                      <div className="flex gap-3">
                        <button onClick={() => openEditModal(item)} className="text-primary hover:underline text-sm font-medium cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-error hover:underline text-sm font-medium cursor-pointer">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-lg border border-outline-variant">
            <h3 className="text-xl font-bold text-on-background mb-4 capitalize">
              {modalMode === 'add' ? `Add New ${tab}` : `Edit ${tab}`}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Asset Code *</label>
                <input 
                  required
                  type="text" 
                  value={formData.asset_code}
                  onChange={e => setFormData({...formData, asset_code: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                  placeholder="e.g. FL-001"
                />
              </div>

              {tab === 'forklift' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Model</label>
                    <input 
                      type="text" 
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                      placeholder="e.g. Toyota 8FD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Year</label>
                    <input 
                      type="text" 
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                      placeholder="e.g. 2021"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Brand</label>
                    <input 
                      type="text" 
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Voltage (V)</label>
                    <input 
                      type="text" 
                      value={formData.voltage}
                      onChange={e => setFormData({...formData, voltage: e.target.value})}
                      className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">Assign to Customer</label>
                <select
                  value={formData.customer_id}
                  onChange={e => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none"
                >
                  <option value="">-- No Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-on-primary px-4 py-2 rounded font-bold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

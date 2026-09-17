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
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
          <p className="text-base text-gray-500 mt-1">Manage Forklifts and Batteries</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Add {tab === 'forklift' ? 'Forklift' : 'Battery'}
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 gap-8 mt-6">
        <button 
          className={`pb-3 text-sm transition-colors cursor-pointer ${tab === 'forklift' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
          onClick={() => { setSearch(''); setTab('forklift'); }}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>forklift</span>
          Forklifts
        </button>
        <button 
          className={`pb-3 text-sm transition-colors cursor-pointer ${tab === 'battery' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
          onClick={() => { setSearch(''); setTab('battery'); }}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>battery_charging_full</span>
          Batteries
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              placeholder={`Search ${tab}s...`} 
              type="text"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Code</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{tab === 'forklift' ? 'Model' : 'Brand'}</th>
                {tab === 'forklift' && <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>}
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{tab === 'forklift' ? 'Health Score' : 'Voltage'}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="p-8 text-center text-gray-500">Loading {tab}s...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={tab === 'forklift' ? 6 : 5} className="p-8 text-center text-gray-500">No {tab}s found</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="px-4 py-3 font-medium text-primary">{item.asset_code}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {tab === 'forklift' ? (item.model || '-') : (item.brand || '-')}
                  </td>
                  {tab === 'forklift' && <td className="px-4 py-3 text-gray-600">{item.year || '-'}</td>}
                  <td className="px-4 py-3 text-gray-600">{item.customer_name || '-'}</td>
                  <td className="px-4 py-3">
                    {tab === 'forklift' ? (
                      <span className={`inline-flex ${
                        item.health_status === 'CRITICAL' ? 'bg-error-container text-on-error-container border border-error/20 px-2.5 py-1 rounded-full text-xs font-medium items-center gap-1.5' :
                        item.health_status === 'ATTENTION' ? 'bg-warning-container text-on-warning-container border border-warning/20 px-2.5 py-1 rounded-full text-xs font-medium items-center gap-1.5' :
                        'bg-success-container text-on-success-container border border-success/20 px-2.5 py-1 rounded-full text-xs font-medium items-center gap-1.5'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.health_status === 'CRITICAL' ? 'bg-error' :
                          item.health_status === 'ATTENTION' ? 'bg-warning' :
                          'bg-success'
                        }`}></span> {item.health_score || 100}%
                      </span>
                    ) : (
                      <span className="text-gray-600 font-medium">{item.voltage ? `${item.voltage}V` : '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEdit && (
                      <div className="flex gap-3 justify-end">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {modalMode === 'add' ? `Add New ${tab}` : `Edit ${tab}`}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Code *</label>
                <input 
                  required
                  type="text" 
                  value={formData.asset_code}
                  onChange={e => setFormData({...formData, asset_code: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                  placeholder="e.g. FL-001"
                />
              </div>

              {tab === 'forklift' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input 
                      type="text" 
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                      placeholder="e.g. Toyota 8FD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input 
                      type="text" 
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                      placeholder="e.g. 2021"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input 
                      type="text" 
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voltage (V)</label>
                    <input 
                      type="text" 
                      value={formData.voltage}
                      onChange={e => setFormData({...formData, voltage: e.target.value})}
                      className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Customer</label>
                <select
                  value={formData.customer_id}
                  onChange={e => setFormData({...formData, customer_id: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none"
                >
                  <option value="">-- No Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

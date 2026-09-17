import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';

export const CustomersPage = () => {
  const { user } = useAuth();
  const canEdit = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '', contact_person: '', contact_phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/customers')
      .then(res => setCustomers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormData({ name: '', location: '', contact_person: '', contact_phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setModalMode('edit');
    setSelectedId(c.id);
    setFormData({ name: c.name, location: c.location || '', contact_person: c.contact_person || '', contact_phone: c.contact_phone || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete customer');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/customers', formData);
      } else {
        await api.put(`/customers/${selectedId}`, formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) || 
      (c.location && c.location.toLowerCase().includes(s)) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(s))
    );
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-base text-gray-500 mt-xs">Manage your customers and their associated assets</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all flex items-center gap-xs cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Customer
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary w-full max-w-md outline-none" 
                placeholder="Search name, contact, location..." 
                type="text"
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 pl-6">Customer Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-sm">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-sm">No customers found</td></tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                    <td className="p-4 pl-6 font-medium">{c.name}</td>
                    <td className="p-4 text-gray-500">{c.location || '-'}</td>
                    <td className="p-4 text-gray-500">{c.contact_person || '-'} <br/><span className="text-sm opacity-75">{c.contact_phone}</span></td>
                    <td className="p-4 pr-6">
                      {canEdit && (
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(c)} className="text-primary hover:underline text-sm font-medium cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="text-error hover:underline text-sm font-medium cursor-pointer">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={formData.contact_phone}
                  onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-6 -mx-6 -mb-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg font-medium cursor-pointer disabled:opacity-50"
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

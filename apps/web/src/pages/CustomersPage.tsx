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
          <h2 className="font-headline-xl text-headline-xl text-on-background">Customer Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage your customers and their associated assets</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Customer
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md shadow-sm">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
            <div className="relative w-80 hidden sm:block">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-body-md h-8 focus:border-primary outline-none" 
                placeholder="Search name, contact, location..." 
                type="text"
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Customer Name</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Location</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Contact Person</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center">No customers found</td></tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                    <td className="p-sm pl-md font-medium">{c.name}</td>
                    <td className="p-sm text-on-surface-variant">{c.location || '-'}</td>
                    <td className="p-sm text-on-surface-variant">{c.contact_person || '-'} <br/><span className="text-xs opacity-75">{c.contact_phone}</span></td>
                    <td className="p-sm pr-md">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-lg border border-outline-variant">
            <h3 className="text-xl font-bold text-on-background mb-4">
              {modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={formData.contact_phone}
                  onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                  className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
                />
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
    </>
  );
};

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast, ConfirmDialog } from '../components/ui';

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

  // Confirm states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

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
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
      toast('Customer deleted successfully', 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to delete customer', 'error');
    } finally {
      setDeleteTarget(null);
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
      toast('Customer saved successfully', 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to save customer', 'error');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-base text-gray-500 mt-1">Manage your customers and their associated assets</p>
        </div>
        {canEdit && (
          <Button variant="primary" icon="add" onClick={openAddModal}>
            Add Customer
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
          <Input 
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, contact, location..." 
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-3.5 text-center text-sm">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-3.5 text-center text-sm">No customers found</td></tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                    <td className="px-5 py-3.5 font-medium">{c.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.location || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <div>{c.contact_person || '-'}</div>
                      <div className="text-sm opacity-75">{c.contact_phone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(c)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(c.id)}>Delete</Button>
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          {modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
        </Modal.Header>
        <Modal.Body>
          <form id="customer-form" onSubmit={handleSave} className="space-y-4">
            <Input 
              label="Customer Name *"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Location"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
            <Input 
              label="Contact Person"
              value={formData.contact_person}
              onChange={e => setFormData({...formData, contact_person: e.target.value})}
            />
            <Input 
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={e => setFormData({...formData, contact_phone: e.target.value})}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="customer-form" loading={isSaving}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog 
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

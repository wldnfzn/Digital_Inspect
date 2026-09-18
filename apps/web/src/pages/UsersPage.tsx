import { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { Button, Modal, Badge, Input, Select, useToast, ConfirmDialog } from '../components/ui';

export const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'MECHANIC',
    is_active: true
  });

  const [toggleTarget, setToggleTarget] = useState<any>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'MECHANIC',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '', // Blank means keep existing
      role: user.role,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit
        await api.put(`/users/${editingUser.id}`, formData);
        toast('User updated successfully!', 'success');
      } else {
        // Add
        if (!formData.password) {
          toast('Password is required for new user', 'error');
          return;
        }
        await api.post('/users', formData);
        toast('User created successfully!', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      toast('Error saving user: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    try {
      await api.put(`/users/${toggleTarget.id}`, {
        full_name: toggleTarget.full_name,
        email: toggleTarget.email,
        role: toggleTarget.role,
        is_active: !toggleTarget.is_active
      });
      fetchUsers();
      toast('User status updated successfully', 'success');
    } catch (error: any) {
      toast('Error updating status: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setToggleTarget(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleClass = (role: string) => {
    switch(role) {
      case UserRole.SUPER_ADMIN: return 'bg-purple-50 text-purple-700 border border-purple-200';
      case UserRole.DIRECTOR: return 'bg-blue-50 text-blue-700 border border-blue-200';
      case UserRole.MANAGER: return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-base text-gray-500 mt-1">Manage system access and user roles</p>
        </div>
        <Button variant="primary" icon="person_add" onClick={openAddModal}>
          Add New User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4 items-center">
          <div className="flex gap-4 w-full sm:w-auto">
            <Input 
              icon="search"
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.DIRECTOR}>Director</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value="MECHANIC">Mechanic</option>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-3.5 text-center text-sm">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-3.5 text-center text-sm">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${getRoleClass(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.is_active ? (
                      <Badge variant="good" dot>Active</Badge>
                    ) : (
                      <Badge variant="inactive" dot>Inactive</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" icon="edit" onClick={() => openEditModal(user)}></Button>
                      <Button variant="ghost" size="sm" icon={user.is_active ? 'block' : 'check_circle'} onClick={() => setToggleTarget(user)}></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header onClose={() => setShowModal(false)}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </Modal.Header>
        <Modal.Body>
          <form id="user-form" onSubmit={handleSave} className="space-y-4">
            <Input 
              label="Full Name *"
              required
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
            <Input 
              label="Email *"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label={`Password ${editingUser ? '(Leave blank to keep current)' : '*'}`}
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <Select 
              label="Role *"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.DIRECTOR}>Director</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value="MECHANIC">Mechanic</option>
            </Select>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="user-form">
            Save User
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog 
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
        title={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${toggleTarget?.is_active ? 'deactivate' : 'activate'} this user?`}
        confirmText="Confirm"
        variant={toggleTarget?.is_active ? 'danger' : 'default'}
      />
    </>
  );
};

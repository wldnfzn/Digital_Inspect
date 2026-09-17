import { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api } from '../lib/api';

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
        alert('User updated successfully!');
      } else {
        // Add
        if (!formData.password) return alert('Password is required for new user');
        await api.post('/users', formData);
        alert('User created successfully!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      alert('Error saving user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`)) return;
    try {
      await api.put(`/users/${user.id}`, {
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (error: any) {
      alert('Error updating status: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full flex flex-col p-gutter-lg space-y-gutter-lg max-w-[1600px] mx-auto print:p-0 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">User Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage system access and user roles</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
          Add New User
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright">
          <div className="flex gap-md w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-body-md h-8 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Search by name or email..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-outline-variant rounded-lg px-2 text-sm bg-surface-container-low h-8 outline-none focus:border-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.DIRECTOR}>Director</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value="MECHANIC">Mechanic</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Name</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Email</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Role</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Status</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Last Login</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                  <td className="p-sm pl-md font-medium text-on-background">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td className="p-sm text-on-surface-variant">{user.email}</td>
                  <td className="p-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-sm text-[11px] border border-outline-variant uppercase tracking-wide">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-sm">
                    <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-[11px] border ${
                      user.is_active 
                        ? 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' 
                        : 'bg-surface-dim text-on-surface-variant border-outline-variant'
                    }`}>
                      {user.is_active && <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-sm text-on-surface-variant text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-sm pr-md text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 cursor-pointer" 
                      title="Edit User"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`transition-colors p-1 ml-1 cursor-pointer ${user.is_active ? 'text-on-surface-variant hover:text-error' : 'text-error hover:text-primary'}`} 
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {user.is_active ? 'block' : 'check_circle'}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-headline-md">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-background cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-md flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  required 
                  className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Email *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                  className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser} 
                  className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Role *</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="border border-outline-variant rounded p-2 bg-surface-bright text-sm outline-none focus:border-primary"
                >
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  <option value={UserRole.DIRECTOR}>Director</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value="MECHANIC">Mechanic</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-outline-variant rounded text-sm font-medium hover:bg-surface-container-low transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-medium hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

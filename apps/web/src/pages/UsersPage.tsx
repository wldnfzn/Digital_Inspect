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
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-base text-gray-500 mt-xs">Manage system access and user roles</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all flex items-center gap-xs cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-6">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4 items-center">
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input 
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary w-full max-w-md outline-none" 
                placeholder="Search by name or email..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
              <tr className="bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                  <td className="p-4 pl-6 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 uppercase tracking-wide">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={user.is_active 
                      ? 'bg-success-container text-on-success-container border border-success/20 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5'
                    }>
                      {user.is_active && <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-gray-400 hover:text-primary transition-colors p-1 cursor-pointer" 
                      title="Edit User"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`transition-colors p-1 ml-1 cursor-pointer ${user.is_active ? 'text-gray-400 hover:text-error' : 'text-gray-400 hover:text-primary'}`} 
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  required 
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser} 
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none"
                >
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  <option value={UserRole.DIRECTOR}>Director</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value="MECHANIC">Mechanic</option>
                </select>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-6 -mx-6 -mb-6">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-primary hover:bg-primary-fixed-variant text-white px-5 py-2.5 rounded-lg font-medium cursor-pointer">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

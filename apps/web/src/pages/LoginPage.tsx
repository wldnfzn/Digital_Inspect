import { useState } from 'react';
import { useAuth } from '../AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@ump.co.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UMP Digital Inspect</h1>
          <p className="text-on-surface-variant text-sm">Please sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md transition-colors mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-outline-variant text-xs text-on-surface-variant">
          <p className="font-semibold mb-1">Dummy Accounts for testing:</p>
          <ul className="space-y-1">
            <li>Admin: admin@ump.co.id</li>
            <li>Manager: manager@ump.co.id</li>
            <li>Password: password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

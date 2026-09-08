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
    <div className="w-full min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">UMP Digital Inspect</h1>
          <p className="text-on-surface-variant text-sm">Please sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] p-3 rounded mb-4 text-sm">
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
              className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-outline-variant rounded p-2 bg-surface-bright focus:border-primary outline-none" 
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-on-primary py-2.5 rounded font-bold hover:bg-on-primary-fixed-variant transition-colors mt-4"
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

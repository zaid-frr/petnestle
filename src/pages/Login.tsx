import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PawPrint } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'mominzaidadmin@gmail.com' && password === 'admin123') {
      login({
        role: 'admin',
        email: 'mominzaidadmin@gmail.com',
        name: 'System Admin'
      });
      showNotification('Logged in successfully', 'success');
      navigate('/dashboard');
      return;
    }

    const roles = ['petOwners', 'doctors', 'trainers', 'hospitals'];
    let foundUser = null;
    let foundRole = '';

    for (const role of roles) {
      const users = JSON.parse(localStorage.getItem(role) || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        foundUser = user;
        foundRole = role;
        break;
      }
    }

    if (foundUser) {
      const roleMap: Record<string, any> = {
        petOwners: 'owner',
        doctors: 'doctor',
        trainers: 'trainer',
        hospitals: 'hospital'
      };
      
      login({
        ...foundUser,
        role: roleMap[foundRole],
        name: foundUser.fullName || foundUser.hospitalName || 'User'
      });
      showNotification('Logged in successfully', 'success');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again or register.');
      showNotification('Invalid email or password', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <PawPrint className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to your PetNestle account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Sign in
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

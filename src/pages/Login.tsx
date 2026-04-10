import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PawPrint } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotification('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      // Check if this is a dummy user in Firestore
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          if (userData.uid && userData.uid.startsWith('dummy_')) {
            await login(userData as any);
            showNotification('Logged in successfully (Dummy Account)', 'success');
            navigate('/dashboard');
            return;
          }
        }
      } catch (firestoreErr) {
        console.error("Error checking dummy user:", firestoreErr);
      }

      console.error("Login error:", err);
      setError(err.message || 'Failed to log in with email and password.');
      showNotification('Failed to log in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showNotification('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to log in with Google.');
      showNotification('Failed to log in', 'error');
    } finally {
      setIsLoading(false);
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
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

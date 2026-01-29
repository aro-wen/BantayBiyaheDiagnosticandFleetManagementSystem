import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User, Radio } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('tech'); // Default selection
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (role === 'admin') {
        navigate('/dispatcher/dashboard');
      } else {
        navigate('/technician/jobs');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Brand Header */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">BantayBiyahe</h1>
          <p className="text-blue-100 text-sm">Fleet Maintenance Management System</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">System Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Role Selection (For Demo Purposes) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('tech')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                  role === 'tech' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-400'
                }`}
              >
                <User size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase">Technician</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                  role === 'admin' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-400'
                }`}
              >
                <Radio size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase">Dispatcher</span>
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">User ID</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    defaultValue={role === 'tech' ? 'T-1047' : 'A-001'}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="password" 
                    defaultValue="password123"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Access Portal'
              )}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              v1.0.0 Stable Build • Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
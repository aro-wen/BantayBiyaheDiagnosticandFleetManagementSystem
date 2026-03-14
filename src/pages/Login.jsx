import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Radio, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Import the logo from your assets folder
import bantayLogo from '../assets/BantayBiyaheLogo.svg';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('tech'); 
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Verify credentials using the secure database function
      const { data, error: authError } = await supabase.rpc('verify_user_login', {
        row_id: userId,
        input_password: password,
        table_name: role === 'admin' ? 'dispatchers' : 'technicians'
      });

      if (authError || !data || data.length === 0) {
        throw new Error("Access Denied: Invalid Credentials");
      }

      // 2. Store manual session
      localStorage.setItem('bantay_user', JSON.stringify(data[0]));

      // 3. Route to the correct portal
      if (data[0].role === 'dispatcher') {
        navigate('/dispatcher/dashboard'); 
      } else {
        navigate('/technician/jobs');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand Header: Using the imported Asset */}
        <div className="bg-white p-10 pb-6 text-center">
          <div className="w-full flex justify-center mb-4">
            <img 
              src={bantayLogo} 
              alt="Bantay Biyahe Logo" 
              className="w-52 h-auto object-contain"
            />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Diagnostic and Fleet Management System
          </p>
        </div>

        <div className="p-10 pt-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase italic">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('tech')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  role === 'tech' 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <User size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Technician</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  role === 'admin' 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Radio size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Dispatcher</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">
                  Portal ID
                </label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-slate-900" />
                  <input 
                    type="text" 
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={role === 'tech' ? "e.g. T-1048" : "e.g. A-002"}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">
                  Access Key
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-slate-900" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Access Portal'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
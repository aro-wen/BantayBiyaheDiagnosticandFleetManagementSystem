import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Truck, 
  Users, 
  Bell, 
  LogOut,
  Radio,
  Wrench // Added for Maintenance Jobs link
} from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import Toast from '../components/Toast';

const DispatcherLayout = () => {
  const navigate = useNavigate();
  const { toast, setToast } = useJobs(); // <--- Connect to Global Toast State

  const handleSignOut = () => {
    // In a real app, you would clear auth tokens here
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg mr-3">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold leading-tight">BantayBiyahe</h1>
            <p className="text-xs text-slate-400">Dispatcher Command</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem to="/dispatcher/dashboard" icon={<LayoutDashboard size={20} />} label="Fleet Overview" />
          <NavItem to="/dispatcher/vehicles" icon={<Truck size={20} />} label="Vehicles" />
          <NavItem to="/dispatcher/assign" icon={<Wrench size={20} />} label="Maintenance Jobs" />
          <NavItem to="/dispatcher/drivers" icon={<Users size={20} />} label="Drivers" />
          <NavItem to="/dispatcher/alerts" icon={<Bell size={20} />} label="Alerts & Notifications" />
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center text-sm text-slate-400 hover:text-white transition-colors w-full px-2 py-2 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </button>
          <p className="text-xs text-center text-slate-600 mt-4">v1.0.0 Dispatcher Build</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col ml-64">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Command Center</h2>
            <p className="text-xs text-slate-500">Welcome back, Dispatcher Marco</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             
             <div className="h-8 w-px bg-slate-200 mx-2"></div>

             <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-slate-700">Marco Polo</p>
                  <p className="text-xs text-slate-500">Admin ID: A-001</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  MP
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper Component for Sidebar Links
const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

export default DispatcherLayout;
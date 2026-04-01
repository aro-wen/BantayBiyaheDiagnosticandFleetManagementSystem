import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  AlertTriangle, 
  History, 
  ClipboardList, 
  Bell, 
  Wrench,
  Gauge,
  LogOut 
} from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import Toast from '../components/Toast';

const TechnicianLayout = () => {
  const navigate = useNavigate();
  const { toast, setToast } = useJobs(); // <--- Connect to Global Toast State

  const handleSignOut = () => {
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
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="bg-blue-600 p-1.5 rounded-lg mr-3">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">BantayBiyahe</h1>
            <p className="text-xs text-slate-500">Technician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem to="/technician/jobs" icon={<Wrench size={20} />} label="Assigned Jobs" />
          <NavItem to="/technician/health" icon={<Bus size={20} />} label="Vehicles" />
          <NavItem to="/technician/technicianmileage" icon={<Gauge size={20} />} label="Mileage Checker" />
          {/* <NavItem to="/technician/dtcs" icon={<AlertTriangle size={20} />} label="DTCs" /> */}
          <NavItem to="/technician/history" icon={<History size={20} />} label="Maintenance History" />
          <NavItem to="/technician/notes" icon={<ClipboardList size={20} />} label="Notes" />
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center text-sm text-slate-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </button>
          <p className="text-xs text-center text-slate-300 mt-4">v1.0.0 Technician Build</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col ml-64">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
            <p className="text-xs text-slate-500">Monitor and manage maintenance operations</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">Juan dela Cruz</p>
                <p className="text-xs text-slate-500">Tech ID: T-1047</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                JD
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
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

export default TechnicianLayout;
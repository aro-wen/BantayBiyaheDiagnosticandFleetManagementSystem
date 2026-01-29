import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import { 
  LayoutDashboard, 
  Map, 
  Truck, 
  Users, 
  Bell, 
  LogOut,
  Radio
} from 'lucide-react';

const DispatcherLayout = () => {
  const navigate = useNavigate(); // <--- 2. Initialize Hook

  const handleSignOut = () => {
    // You could clear session storage here if needed
    navigate('/'); // <--- 3. Redirect to Login
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
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
          <NavItem to="/dispatcher/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/dispatcher/vehicles" icon={<Truck size={20} />} label="Vehicles" />
          <NavItem to="/dispatcher/assign" icon={<Truck size={20} />} label="Job Assignment" />
          <NavItem to="/dispatcher/drivers" icon={<Users size={20} />} label="Driver Management" />
          <NavItem to="/dispatcher/alerts" icon={<Bell size={20} />} label="System Alerts" />
        </nav>

        {/* Footer with Working Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleSignOut} // <--- 4. Add Click Handler
            className="flex items-center text-sm text-slate-400 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area... (Unchanged) */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Command Center</h2>
            <p className="text-xs text-slate-500">Welcome back, Dispatcher Marco</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">Marco Polo</p>
                <p className="text-xs text-slate-500">Admin ID: A-001</p>
              </div>
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                MP
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

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
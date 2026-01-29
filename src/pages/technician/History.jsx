import React, { useState } from 'react';
import { Calendar, Search, FileText, User } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const MOCK_HISTORY = [
  {
    id: 'J-2390',
    date: '1/23/2026',
    vehicle: 'V-102',
    plate: 'PQR 2468',
    action: 'Tire rotation and balance',
    notes: 'All tires rotated. Front tires showed even wear.',
    tech: 'Juan dela Cruz'
  },
  {
    id: 'SM-2395',
    date: '1/23/2026',
    vehicle: 'V-103',
    plate: 'DEF 5678',
    action: 'Bi-weekly preventive check',
    notes: 'Oil level good. Checked all fluids. Minor oil leak detected.',
    tech: 'Maria Santos'
  },
  {
    id: 'J-2385',
    date: '1/22/2026',
    vehicle: 'V-104',
    plate: 'STU 1357',
    action: 'Brake pad replacement',
    notes: 'Replaced front brake pads. Rear pads at 40% life.',
    tech: 'Juan dela Cruz'
  }
];

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = MOCK_HISTORY.filter(item => 
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium">Total Completed Jobs</div>
          <div className="text-3xl font-bold text-slate-800">8</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium">Preventive Checks</div>
          <div className="text-3xl font-bold text-green-600">3</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium">This Week</div>
          <div className="text-3xl font-bold text-blue-600">8</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
         <div className="relative w-64">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search Vehicle or Action..." 
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <div className="flex gap-2">
            <input type="date" className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600" />
            <span className="self-center text-slate-400">-</span>
            <input type="date" className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600" />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Action Taken</th>
              <th className="px-6 py-4">Technician</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{item.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{item.vehicle}</div>
                  <div className="text-xs text-slate-500">{item.plate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-800">{item.action}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.notes}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 flex items-center">
                  <User size={14} className="mr-2 text-slate-400" />
                  {item.tech}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
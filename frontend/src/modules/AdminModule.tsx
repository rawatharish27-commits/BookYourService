import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import db from './DatabaseService';
import { 
  UserRole, VerificationStatus, BookingStatus, Problem
} from './types';
import { adminOps } from './AdminOpsService';
import { infra } from './InfraComplianceService';
import { qaLab } from './QAAutomationService';

type AdminTab = 
  | 'DASHBOARD' 
  | 'MONITOR' 
  | 'ONTOLOGY' 
  | 'INFRA'
  | 'QA_LAB';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(adminOps.getOpsStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(adminOps.getOpsStats());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const SidebarItem = ({ id, label, icon }: { id: AdminTab, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      <aside className="w-80 bg-[#0A2540] p-8 flex flex-col border-r border-white/5 shadow-2xl z-50 overflow-y-auto custom-scrollbar">
        <div className="mb-12">
          <h1 className="text-2xl font-black text-white italic tracking-tighter">ADMIN<span className="text-blue-500">NODE</span></h1>
          <p className="text-[7px] font-black text-blue-300 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM NOMINAL
          </p>
        </div>
        <nav className="flex-1 space-y-1 pr-2">
          <SidebarItem id="DASHBOARD" label="Telemetry" icon="📊" />
          <SidebarItem id="INFRA" label="GCP Console" icon="☁️" />
          <SidebarItem id="QA_LAB" label="Resilience Lab" icon="🧪" />
          <SidebarItem id="ONTOLOGY" label="Catalog" icon="🧩" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Global <span className="text-blue-500">Telemetry.</span></h2>
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Revenue Today', val: `₹${stats.revenueToday}`, icon: '💰' },
                { label: 'SLA Breaches', val: stats.slaBreaches, icon: '🚨' },
                { label: 'Active Nodes', val: db.getUsers().length, icon: '📱' },
                { label: 'Latency', val: '14ms', icon: '🟢' }
              ].map((k, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
                  <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">{k.val}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminModule;
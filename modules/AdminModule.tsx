
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { db } from '../services/DatabaseService';
import { 
  UserRole, VerificationStatus, BookingStatus, Problem
} from '../types';
import { adminOps } from '../services/AdminOpsService';
import { infra } from '../services/InfraComplianceService';
import { qaLab } from '../services/QAAutomationService';
import { providerService } from '../services/ProviderService';

type AdminTab = 
  | 'DASHBOARD' 
  | 'VERIFICATION' 
  | 'MONITOR' 
  | 'ONTOLOGY' 
  | 'INFRA'
  | 'DISPUTES'
  | 'QA_LAB';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(adminOps.getOpsStats());
  const [qaLogs, setQaLogs] = useState<string[]>([]);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(adminOps.getOpsStats());
      if (activeTab === 'QA_LAB') {
        setQaLogs([...qaLab.getLogs()]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const users = db.getUsers();
  const problems = db.getProblems();
  const complaints = db.getComplaints();

  const filteredProblems = useMemo(() => {
    const pList = problems || [];
    if (!searchTerm) return pList.slice(0, 50);
    const term = searchTerm.toLowerCase();
    return pList.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.ontologyId.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [searchTerm, problems]);

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
          <SidebarItem id="VERIFICATION" label="Verification" icon="🪪" />
          <SidebarItem id="ONTOLOGY" label="Catalog" icon="🧩" />
          <SidebarItem id="DISPUTES" label="Disputes" icon="⚖️" />
          <SidebarItem id="INFRA" label="GCP Console" icon="☁️" />
          <SidebarItem id="QA_LAB" label="Resilience Lab" icon="🧪" />
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

        {activeTab === 'VERIFICATION' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Identity <span className="text-blue-500">Audit.</span></h2>
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Provider</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Docs</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.filter(u => u.verificationStatus === VerificationStatus.KYC_PENDING || u.verificationStatus === VerificationStatus.REGISTERED && u.kycDetails?.documentsUploaded).map(u => (
                    <tr key={u.id}>
                      <td className="p-8 font-black text-[#0A2540] uppercase italic">{u.name}</td>
                      <td className="p-8 text-[10px] text-slate-500 font-mono">AD:{u.kycDetails?.aadhaarNumber} | PAN:{u.kycDetails?.panNumber}</td>
                      <td className="p-8 flex gap-4 justify-center">
                        <button onClick={() => providerService.approveProvider('ADMIN_ROOT', u.id)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Approve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ONTOLOGY' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Catalog <span className="text-blue-500">Nodes.</span></h2>
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Node</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Mod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProblems.map(p => (
                    <tr key={p.id}>
                      <td className="p-8 font-black text-[#0A2540] uppercase italic tracking-tighter">{p.title}</td>
                      <td className="p-8 text-center">
                        <button onClick={() => setEditingProblem(p)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'QA_LAB' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">QA <span className="text-blue-500">Node.</span></h2>
            <div className="bg-[#0A2540] p-12 rounded-[5rem] text-white shadow-3xl">
              <div className="space-y-2 h-96 overflow-y-auto custom-scrollbar font-mono text-[10px] pr-8">
                {qaLogs.map((log, i) => (
                  <div key={i} className="p-3 border-l-4 border-blue-500 bg-white/5 mb-2">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {editingProblem && (
        <div className="fixed inset-0 bg-[#0A2540]/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-8 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[5rem] p-16 shadow-3xl space-y-12 animate-slideUp">
            <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic">{editingProblem.title}</h3>
            <button onClick={() => setEditingProblem(null)} className="w-full bg-slate-50 text-slate-400 py-6 rounded-3xl font-black uppercase text-xs tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;

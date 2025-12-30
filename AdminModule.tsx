
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { db } from '../DatabaseService';
import { 
  UserRole, VerificationStatus, User, ProviderStatus, 
  UserStatus, AdminRole, BookingStatus, Problem, 
  Complaint, Incident, CityConfig, Category 
} from '../types';
import { adminOps } from '../AdminOpsService';
import { infra } from '../InfraComplianceService';
import { qaLab } from '../QAAutomationService';
import { providerService } from '../ProviderService';

type AdminTab = 
  | 'DASHBOARD' 
  | 'VERIFICATION' 
  | 'MONITOR' 
  | 'ONTOLOGY' 
  | 'CATEGORIES'
  | 'CITIES' 
  | 'DISPUTES' 
  | 'FRAUD' 
  | 'AUDIT' 
  | 'INFRA'
  | 'QA_LAB';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [stats, setStats] = useState(adminOps.getOpsStats());
  const [qaLogs, setQaLogs] = useState<string[]>([]);

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
  const bookings = db.getBookings();
  const problems = db.getProblems();
  const auditLogs = db.getAuditLogs();
  const cities = db.getCities();
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
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM NOMINAL v7.0
          </p>
        </div>

        <nav className="flex-1 space-y-1 pr-2">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4 px-4">Core Ops</div>
          <SidebarItem id="DASHBOARD" label="Telemetry" icon="📊" />
          <SidebarItem id="MONITOR" label="Live Jobs" icon="📡" />
          <SidebarItem id="VERIFICATION" label="Verification" icon="🪪" />
          
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-8 mb-4 px-4">Governance</div>
          <SidebarItem id="ONTOLOGY" label="Catalog" icon="🧩" />
          <SidebarItem id="CITIES" label="Regional Nodes" icon="🏙️" />
          
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-8 mb-4 px-4">Security</div>
          <SidebarItem id="DISPUTES" label="Disputes" icon="⚖️" />
          <SidebarItem id="FRAUD" label="Fraud Risk" icon="🛡️" />
          <SidebarItem id="AUDIT" label="Forensic Logs" icon="📜" />
          <SidebarItem id="QA_LAB" label="QA Lab" icon="🧪" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">System <span className="text-blue-500">Overview.</span></h2>
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Revenue Today', val: `₹${stats.revenueToday}`, icon: '💰' },
                { label: 'Active Jobs', val: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length, icon: '🛠️' },
                { label: 'SLA Breaches', val: stats.slaBreaches, icon: '🚨' },
                { label: 'Pending Audit', val: users.filter(u => u.verificationStatus === VerificationStatus.KYC_PENDING).length, icon: '🪪' }
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
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Status</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.filter(u => u.verificationStatus === VerificationStatus.KYC_PENDING).map(u => (
                    <tr key={u.id}>
                      <td className="p-8 font-black text-[#0A2540] uppercase italic">{u.name}</td>
                      <td className="p-8 text-[10px] text-slate-500 font-mono">AD:{u.kycDetails?.aadhaarNumber} | PAN:{u.kycDetails?.panNumber}</td>
                      <td className="p-8">
                        <span className="bg-amber-50 text-amber-600 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100">Pending Review</span>
                      </td>
                      <td className="p-8 flex gap-4 justify-center">
                        <button onClick={() => providerService.approveProvider('ADMIN_ROOT', u.id)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Approve</button>
                        <button className="bg-rose-50 text-rose-500 px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.filter(u => u.verificationStatus === VerificationStatus.KYC_PENDING).length === 0 && (
                <div className="p-20 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.5em]">No pending audit nodes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'DISPUTES' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Dispute <span className="text-blue-500">Center.</span></h2>
            <div className="grid grid-cols-2 gap-8">
              {complaints.filter(c => c.status === 'OPEN').map(c => (
                <div key={c.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="bg-rose-50 text-rose-600 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-100">{c.severity} Severity</span>
                    <span className="text-[10px] font-mono text-slate-300">#{c.id}</span>
                  </div>
                  <h4 className="text-xl font-black text-[#0A2540] tracking-tighter uppercase italic">{c.category}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"{c.description}"</p>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => adminOps.resolveDispute('ADMIN_ROOT', c.id, 'REFUND')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg">Refund User</button>
                    <button onClick={() => adminOps.resolveDispute('ADMIN_ROOT', c.id, 'PENALIZE_PRO')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Penalize Pro</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'QA_LAB' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">QA <span className="text-blue-500">Node.</span></h2>
            <div className="grid grid-cols-3 gap-8">
              {/* Fix: Replaced non-existent runDeepE2EFlow with runFullConsumerLoop from QAAutomationService */}
              <button onClick={() => qaLab.runFullConsumerLoop()} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-4 hover:border-emerald-500 transition-all group">
                <div className="text-4xl group-hover:scale-110 transition-transform">✅</div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfect Flow</h4>
              </button>
              {/* Fix: replaced non-existent runStressTest with runAdminOverrideTest */}
              <button onClick={() => qaLab.runAdminOverrideTest()} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-4 hover:border-blue-500 transition-all group">
                <div className="text-4xl group-hover:scale-110 transition-transform">⚡</div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress Test</h4>
              </button>
              <button onClick={() => qaLab.runFraudSimulation()} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-4 hover:border-rose-500 transition-all group">
                <div className="text-4xl group-hover:scale-110 transition-transform">🚨</div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fraud Trigger</h4>
              </button>
            </div>
            <div className="bg-[#0A2540] p-12 rounded-[5rem] text-white shadow-3xl">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Simulation Console</h4>
                <button onClick={() => setQaLogs([])} className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Clear</button>
              </div>
              <div className="space-y-2 h-96 overflow-y-auto custom-scrollbar font-mono text-[10px] pr-8">
                {qaLogs.map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg border-l-4 ${log.includes('Success') ? 'border-emerald-500 bg-emerald-500/10' : log.includes('Error') ? 'border-rose-500 bg-rose-500/10' : 'border-blue-500 bg-white/5'}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ONTOLOGY' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Catalog <span className="text-blue-500">Nodes.</span></h2>
            <div className="relative group max-w-xl">
              <input 
                type="text" 
                placeholder="Search 2,000+ Problem Nodes..." 
                className="bg-white border-2 border-slate-100 p-6 pl-14 rounded-3xl text-[11px] font-black uppercase tracking-widest w-full outline-none focus:border-blue-500 shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-6 top-6 opacity-30">🔍</span>
            </div>
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Node</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Base</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Max</th>
                    <th className="p-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Mod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProblems.map(p => (
                    <tr key={p.id}>
                      <td className="p-8">
                        <p className="font-black text-[#0A2540] uppercase italic tracking-tighter">{p.title}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.category} | {p.ontologyId}</p>
                      </td>
                      <td className="p-8 font-black">₹{p.basePrice}</td>
                      <td className="p-8 font-black text-rose-500">₹{p.maxPrice}</td>
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
      </main>

      {editingProblem && (
        <div className="fixed inset-0 bg-[#0A2540]/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-8 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[5rem] p-16 shadow-3xl space-y-12 animate-slideUp">
            <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic">{editingProblem.title}</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base</label>
                <input id="edit-base" type="number" className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-2xl w-full outline-none focus:border-blue-500" defaultValue={editingProblem.basePrice} />
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Max Cap</label>
                <input id="edit-max" type="number" className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-2xl w-full outline-none focus:border-rose-500" defaultValue={editingProblem.maxPrice} />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => {
                const b = (document.getElementById('edit-base') as HTMLInputElement).value;
                const m = (document.getElementById('edit-max') as HTMLInputElement).value;
                adminOps.updateProblemPricing('ADMIN_ROOT', editingProblem.id, parseInt(b), parseInt(m));
                setEditingProblem(null);
              }} className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">Update Node</button>
              <button onClick={() => setEditingProblem(null)} className="flex-1 bg-slate-50 text-slate-400 py-6 rounded-3xl font-black uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;

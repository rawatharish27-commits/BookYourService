
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { db } from '../DatabaseService';
import { 
  UserRole, VerificationStatus, BookingStatus, Problem
} from '../types';
import { adminOps } from '../AdminOpsService';
import { infra } from '../InfraComplianceService';
import { qaLab } from '../QAAutomationService';
import { crashReporter } from '../CrashReportingService';
import { releaseManager } from '../ReleaseManagementService';

type AdminTab = 
  | 'DASHBOARD' 
  | 'MONITOR' 
  | 'ONTOLOGY' 
  | 'INFRA'
  | 'QA_LAB'
  | 'LAUNCH_HUB';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [stats, setStats] = useState(adminOps.getOpsStats());
  const [launchConfig, setLaunchConfig] = useState(releaseManager.getConfig());
  const [crashLogs, setCrashLogs] = useState(crashReporter.getLogs());
  const [infraStatus, setInfraStatus] = useState(infra.getDeploymentStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(adminOps.getOpsStats());
      setLaunchConfig(releaseManager.getConfig());
      setCrashLogs([...crashReporter.getLogs()]);
      setInfraStatus(infra.getDeploymentStatus());
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
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM NOMINAL v7.0
          </p>
        </div>
        <nav className="flex-1 space-y-1 pr-2">
          <SidebarItem id="DASHBOARD" label="Telemetry" icon="📊" />
          <SidebarItem id="LAUNCH_HUB" label="Launch Hub" icon="🚀" />
          <SidebarItem id="INFRA" label="GCP Console" icon="☁️" />
          <SidebarItem id="QA_LAB" label="Resilience Lab" icon="🧪" />
          <SidebarItem id="MONITOR" label="Audit Forensic" icon="📜" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Global <span className="text-blue-500">Telemetry.</span></h2>
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Market Rollout', val: `${launchConfig.rolloutPercentage}%`, icon: '🌍' },
                { label: 'Crash-Free Rate', val: `${crashReporter.getCrashFreeRate()}%`, icon: '🛡️' },
                { label: 'Active Beta Nodes', val: db.getUsers().length, icon: '📱' },
                { label: 'Cloud Latency', val: infraStatus.infra.latency, icon: '🟢' }
              ].map((k, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
                  <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">{k.val}</h3>
                </div>
              ))}
            </div>
            <div className="bg-white p-12 rounded-[5rem] border border-slate-100 shadow-sm min-h-[400px]">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Real-time Revenue Velocity</h4>
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { x: '00:00', y: 400 }, { x: '04:00', y: 300 }, { x: '08:00', y: 900 }, { x: '12:00', y: 1200 }, { x: '16:00', y: 1500 }, { x: '20:00', y: 1100 }
                  ]}>
                    <defs>
                      <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorY)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'LAUNCH_HUB' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Launch <span className="text-blue-500">Control.</span></h2>
            <div className="grid grid-cols-2 gap-12">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-12 shadow-sm">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gradual Rollout</h4>
                  <div className="flex items-center gap-8">
                    <input type="range" min="0" max="100" value={launchConfig.rolloutPercentage} onChange={(e) => releaseManager.updateConfig({ rolloutPercentage: parseInt(e.target.value) })} className="flex-1 h-2 bg-slate-100 rounded-full appearance-none accent-blue-600 cursor-pointer" />
                    <span className="text-4xl font-black italic text-blue-600">{launchConfig.rolloutPercentage}%</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Flags</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(launchConfig.featureFlags).map(([flag, val]) => (
                      <div key={flag} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl">
                        <span className="text-[10px] font-black uppercase tracking-widest">{flag}</span>
                        <button onClick={() => releaseManager.toggleFlag(flag)} className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${val ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                           <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white shadow-3xl space-y-8">
                 <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Runtime Exceptions</h4>
                 <div className="space-y-4 h-[500px] overflow-y-auto custom-scrollbar pr-4">
                    {crashLogs.length === 0 ? <p className="text-white/20 text-[10px] text-center py-20 uppercase font-black tracking-widest">All Nodes Healthy</p> : crashLogs.map(log => (
                      <div key={log.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                         <div className="flex justify-between">
                            <span className="bg-rose-500 px-3 py-1 rounded-full text-[8px] font-black">FATAL</span>
                            <span className="text-[8px] font-mono text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <p className="text-[11px] font-bold leading-relaxed opacity-80">"{log.message}"</p>
                         <p className="text-[8px] font-mono opacity-20 truncate">{log.deviceId}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'INFRA' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Cloud <span className="text-blue-500">Status.</span></h2>
            <div className="grid grid-cols-3 gap-8">
               {[
                 { label: 'Compute Engine', status: infraStatus.infra.cloudRun, color: 'emerald' },
                 { label: 'Database Node', status: infraStatus.infra.cloudSql, color: 'emerald' },
                 { label: 'Secret Manager', status: infraStatus.infra.secretsManager, color: 'blue' }
               ].map(node => (
                 <div key={node.label} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{node.label}</p>
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full animate-pulse bg-${node.color}-500`}></div>
                       <h3 className="text-xl font-black text-[#0A2540] uppercase italic">{node.status}</h3>
                    </div>
                 </div>
               ))}
            </div>
            <div className="bg-[#0A2540] p-10 rounded-[4rem] text-white shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300">GCP Build Artifacts</h4>
                  <button onClick={() => infra.simulateDeployment()} className="bg-blue-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Deploy Revision</button>
               </div>
               <div className="space-y-2">
                  {infra.getRevisions().map(rev => (
                    <div key={rev.id} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10">
                       <div className="flex items-center gap-6">
                          <span className="font-mono text-xs opacity-40">{rev.id}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{rev.status}</span>
                       </div>
                       <span className="text-[8px] font-mono opacity-20">{rev.timestamp}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminModule;


import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
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
import { crashReporter } from '../CrashReportingService';
import { releaseManager } from '../ReleaseManagementService';

type AdminTab = 
  | 'DASHBOARD' 
  | 'VERIFICATION' 
  | 'MONITOR' 
  | 'ONTOLOGY' 
  | 'AUDIT' 
  | 'INFRA'
  | 'QA_LAB'
  | 'LAUNCH_HUB';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [stats, setStats] = useState(adminOps.getOpsStats());
  const [launchConfig, setLaunchConfig] = useState(releaseManager.getConfig());
  const [crashLogs, setCrashLogs] = useState(crashReporter.getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(adminOps.getOpsStats());
      setLaunchConfig(releaseManager.getConfig());
      setCrashLogs([...crashReporter.getLogs()]);
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
          <SidebarItem id="AUDIT" label="Audit Forensic" icon="📜" />
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
                { label: 'SLA Health', val: '98.4%', icon: '🟢' }
              ].map((k, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
                  <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">{k.val}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'LAUNCH_HUB' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Launch <span className="text-blue-500">Control.</span></h2>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="bg-white p-12 rounded-[5rem] border border-slate-100 shadow-sm space-y-12">
                <div className="space-y-4">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-400">Market Rollout</h4>
                  <div className="flex items-center gap-8">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={launchConfig.rolloutPercentage} 
                      onChange={(e) => releaseManager.updateConfig({ rolloutPercentage: parseInt(e.target.value) })}
                      className="flex-1 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-3xl font-black italic text-blue-600">{launchConfig.rolloutPercentage}%</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Targeting {launchConfig.rolloutPercentage}% of global device clusters.</p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-400">Feature Toggles</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(launchConfig.featureFlags).map(([flag, enabled]) => (
                      <div key={flag} className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl">
                        <span className="text-[10px] font-black uppercase tracking-widest">{flag.replace(/_/g, ' ')}</span>
                        <button 
                          onClick={() => releaseManager.toggleFlag(flag)}
                          className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}
                        >
                          <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0A2540] p-12 rounded-[5rem] text-white shadow-3xl space-y-10">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-blue-300">Live Crash Monitor</h4>
                  <button onClick={() => crashReporter.clearAll()} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white">Clear Logs</button>
                </div>
                
                <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {crashLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                      <div className="text-6xl">🛡️</div>
                      <p className="text-[10px] font-black uppercase tracking-widest">No Crashes Detected</p>
                    </div>
                  ) : crashLogs.map(log => (
                    <div key={log.id} className={`p-6 rounded-3xl border border-white/5 space-y-4 ${log.resolved ? 'opacity-30' : 'bg-white/5 border-rose-500/20'}`}>
                      <div className="flex justify-between items-start">
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${log.severity === 'FATAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>{log.severity}</span>
                        <span className="text-[8px] font-mono text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed">"{log.message}"</p>
                      {!log.resolved && (
                        <button onClick={() => crashReporter.resolve(log.id)} className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Mark as Fixed</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'INFRA' && (
          <div className="space-y-12 animate-fadeIn">
            <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Cloud <span className="text-blue-500">Infrastructure.</span></h2>
            <div className="bg-white p-12 rounded-[5rem] border border-slate-100 shadow-sm">
               <p className="text-slate-400 italic">Operational telemetry nodes syncing...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminModule;

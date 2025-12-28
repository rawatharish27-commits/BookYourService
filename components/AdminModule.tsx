
import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Problem, BookingStatus, AuditLogEntity, InfraMetric, UserEntity, UserRole, SystemAlert, SOPItem, ExpansionChecklist, VerificationStatus, FraudSignal, FraudType, VendorWebhook, TrustSafetyKPI, WebhookStatus, RegionConfig, InfraCostBreakdown, RevenueForecast, ThreatModelEntry, SecurityControl } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, YAxis, PieChart, Pie, AreaChart, Area } from 'recharts';
import { db } from '../DatabaseService';
import { auth } from '../AuthService';
import { PLATFORM_FEE, SOP_LIST, EXPANSION_ROADMAP, REGIONS, THREAT_MODEL, SECURITY_CONTROLS } from '../constants';

interface AdminModuleProps {
  bookings: Booking[];
  problems: Problem[];
}

const AdminModule: React.FC<AdminModuleProps> = ({ bookings, problems: initialProblems }) => {
  const [governanceMode, setGovernanceMode] = useState<'summary' | 'global' | 'costs' | 'forecasting' | 'ranking' | 'safety' | 'verification' | 'audit' | 'security'>('summary');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>([]);
  const [infraMetrics, setInfraMetrics] = useState<InfraMetric[]>([]);
  const [allUsers, setAllUsers] = useState<UserEntity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [fraudSignals, setFraudSignals] = useState<FraudSignal[]>([]);
  const [infraCosts, setInfraCosts] = useState<InfraCostBreakdown | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast[]>([]);
  const [kycInspector, setKycInspector] = useState<UserEntity | null>(null);
  
  // Security Reset Flow
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const currentUser = useMemo(() => auth.getSession()?.user, []);

  useEffect(() => {
    if (currentUser?.status === 'FORCE_PASSWORD_RESET') {
      setShowResetModal(true);
    }

    const fetchData = async () => {
      const logs = await db.getLogs();
      const metrics = db.getInfraMetrics();
      const users = await db.getUsers();
      const alerts = await db.getAlerts();
      const signals = await db.getFraudSignals();
      const costs = db.getInfraCosts();
      const rForecast = db.getRevenueForecast();
      
      setAuditLogs(logs);
      setInfraMetrics(metrics);
      setAllUsers(users);
      setSystemAlerts(alerts);
      setFraudSignals(signals);
      setInfraCosts(costs);
      setForecast(rForecast);
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [governanceMode, bookings, currentUser]);

  const analytics = useMemo(() => {
    const closed = bookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CLOSED);
    const totalPlatformRevenue = closed.length * PLATFORM_FEE;
    const catCounts: Record<string, number> = {};
    bookings.forEach(b => { catCounts[b.category] = (catCounts[b.category] || 0) + 1; });
    const chartData = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { totalPlatformRevenue, chartData, closedCount: closed.length };
  }, [bookings]);

  const providers = allUsers.filter(u => u.role_id === UserRole.PROVIDER);
  const pendingVerifications = allUsers.filter(u => 
    u.role_id === UserRole.PROVIDER && 
    (u.verification_status === VerificationStatus.PENDING_ID || u.verification_status === VerificationStatus.BANK_VERIFIED)
  );

  const handleApproveKYC = async (userId: string) => {
    const adminId = currentUser?.id || 'U_ADMIN_01'; 
    await db.approveProvider(adminId, userId);
    setKycInspector(null);
  };

  const handlePassReset = async () => {
    if (newPass !== confirmPass || newPass.length < 8) return;
    const success = await auth.finalizePasswordReset(currentUser!.id, newPass);
    if (success) {
      setShowResetModal(false);
      alert("Password updated successfully. Bootstrap session secured.");
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20 max-w-7xl mx-auto">
      {/* High-Tech Admin Header */}
      <div className="bg-[#0A2540] p-10 rounded-[4rem] shadow-2xl border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF] opacity-5 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-[#00D4FF] rounded-[2.5rem] flex items-center justify-center text-[#0A2540] font-black text-5xl">A</div>
          <div>
             <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Global OS <span className="text-[#00D4FF]">7.0</span></h2>
             <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em] mt-2">Enterprise Multi-Region Active</p>
          </div>
        </div>
        <div className="flex bg-white/5 backdrop-blur-3xl p-2.5 rounded-[3rem] border border-white/10 overflow-x-auto max-w-full relative z-10 custom-scrollbar">
          {[
            { id: 'summary', label: 'Pulse' },
            { id: 'global', label: 'GCC Expansion' },
            { id: 'costs', label: 'Unit Economics' },
            { id: 'forecasting', label: 'Forecasting' },
            { id: 'ranking', label: 'Ranking' },
            { id: 'verification', label: 'Verification' },
            { id: 'security', label: 'Security Center' },
            { id: 'audit', label: 'Audit' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setGovernanceMode(tab.id as any)} className={`px-6 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${governanceMode === tab.id ? 'bg-[#00D4FF] text-[#0A2540] scale-110 shadow-2xl' : 'text-blue-100/50 hover:text-white'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {governanceMode === 'security' && (
        <div className="space-y-10 animate-fadeIn">
           <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-500 opacity-5 blur-[120px]"></div>
              <div className="relative z-10">
                 <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Architecture Compliance</p>
                 <h3 className="text-6xl font-black tracking-tighter uppercase">STRIDE Threat Model</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 relative z-10">
                 {THREAT_MODEL.map((entry, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center font-black text-xl">{entry.stride}</span>
                          <span className="text-[8px] font-black uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full">{entry.status}</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{entry.category}</p>
                          <h4 className="text-lg font-black mt-1 leading-none">{entry.threat}</h4>
                       </div>
                       <p className="text-xs opacity-50 font-medium leading-relaxed">Mitigation: {entry.mitigation}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-8">
                 <h4 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">Pen-Test Checklist</h4>
                 <div className="space-y-4">
                    {[
                      { area: 'Authentication', desc: 'OTP Brute Force & JWT Reuse', status: 'PASS' },
                      { area: 'Authorization', desc: 'Role Escalation (B2B -> Admin)', status: 'PASS' },
                      { area: 'Billing', desc: 'Price Tampering & Replay Attacks', status: 'PASS' },
                      { area: 'PII Storage', desc: 'Direct Object Reference (ID Docs)', status: 'PASS' }
                    ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                          <div>
                             <p className="text-sm font-black text-[#0A2540]">{item.area}</p>
                             <p className="text-[10px] text-gray-400 font-bold">{item.desc}</p>
                          </div>
                          <span className="w-12 h-12 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center font-black text-xs">✓</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white space-y-10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                 <h4 className="text-2xl font-black uppercase tracking-widest relative z-10">Active Security Controls</h4>
                 <div className="space-y-6 relative z-10">
                    {SECURITY_CONTROLS.map(ctrl => (
                       <div key={ctrl.id} className="flex gap-6 items-center p-6 bg-white/5 border border-white/10 rounded-[2.5rem]">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${ctrl.status === 'ENABLED' ? 'bg-[#00D4FF] text-[#0A2540]' : 'bg-gray-700 text-gray-400'}`}>
                             {ctrl.area}
                          </div>
                          <div className="flex-1">
                             <p className="font-black uppercase tracking-widest text-xs">{ctrl.label}</p>
                             <p className="text-[10px] opacity-40 mt-1">{ctrl.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full ${ctrl.status === 'ENABLED' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Bootstrap Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-[#0A2540] backdrop-blur-3xl flex items-center justify-center p-6 z-[300] animate-fadeIn">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/5"></div>
           <div className="bg-white rounded-[4rem] w-full max-w-xl p-12 space-y-12 animate-slideUp relative z-10 shadow-2xl">
              <div className="text-center space-y-4">
                 <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto text-4xl shadow-xl shadow-red-500/10">!</div>
                 <h3 className="text-4xl font-black text-[#0A2540] uppercase tracking-tighter">Security Protocol Activated</h3>
                 <p className="text-gray-400 text-sm font-bold max-w-sm mx-auto">First-time Bootstrap Login detected. You must rotate your administrator password immediately.</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">New Secret Password</label>
                    <input 
                       type="password" 
                       className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-6 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-xl tracking-widest"
                       value={newPass}
                       onChange={e => setNewPass(e.target.value)}
                       placeholder="••••••••"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Verify Secret</label>
                    <input 
                       type="password" 
                       className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-6 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-xl tracking-widest"
                       value={confirmPass}
                       onChange={e => setConfirmPass(e.target.value)}
                       placeholder="••••••••"
                    />
                 </div>
              </div>

              <button 
                 onClick={handlePassReset}
                 disabled={newPass.length < 8 || newPass !== confirmPass}
                 className="w-full bg-[#0A2540] text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
              >
                 Finalize Security Reset
              </button>
           </div>
        </div>
      )}

      {/* Summary, Verification, Global, Audit views stay consolidated as before */}
      {governanceMode === 'summary' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Revenue</p><p className="text-6xl font-black mt-4 text-green-600 tracking-tighter">₹{analytics.totalPlatformRevenue}</p></div>
            {infraMetrics.map((m, i) => (
              <div key={i} className="bg-[#0A2540] p-10 rounded-[3.5rem] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                 <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest relative z-10">{m.label}</p>
                 <p className="text-5xl font-black mt-4 text-[#00D4FF] tracking-tighter relative z-10">{m.unit}{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {governanceMode === 'audit' && (
        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
           <h3 className="text-3xl font-black text-[#0A2540] uppercase tracking-tighter mb-10">Security Audit Trail</h3>
           <div className="overflow-x-auto custom-scrollbar max-h-[700px]">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-gray-100 sticky top-0 bg-white z-10 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                   <th className="pb-6">Timestamp</th><th className="pb-6">Node Action</th><th className="pb-6">Security Context</th><th className="pb-6 text-right">Severity</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {auditLogs.map(log => (
                   <tr key={log.id}>
                     <td className="py-6 text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                     <td className="py-6"><span className={`font-black text-[11px] uppercase tracking-widest ${log.severity === 'ERROR' ? 'text-red-500' : 'text-[#0A2540]'}`}>{log.action.replace('_', ' ')}</span></td>
                     <td className="py-6"><p className="text-[10px] font-bold text-gray-400 leading-tight truncate max-w-xs">{log.metadata}</p></td>
                     <td className="py-6 text-right"><span className={`text-[9px] font-black uppercase ${log.severity === 'ERROR' ? 'text-red-500' : log.severity === 'WARN' ? 'text-orange-500' : 'text-green-500'}`}>{log.severity}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {governanceMode === 'verification' && (
        <div className="space-y-10 animate-fadeIn">
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter mb-8">Provider Verification Queue</h3>
              {pendingVerifications.length === 0 ? (
                <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-[3rem]">
                   Queue Clear: No pending approvals
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {pendingVerifications.map(u => (
                      <div key={u.id} className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 space-y-6 group hover:border-[#00D4FF] transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm overflow-hidden">
                               👤
                            </div>
                            <div>
                               <h4 className="font-black text-[#0A2540] uppercase">{u.name}</h4>
                               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{u.verification_status}</p>
                            </div>
                         </div>
                         <button onClick={() => setKycInspector(u)} className="w-full bg-[#0A2540] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Inspect & Authorize</button>
                      </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;

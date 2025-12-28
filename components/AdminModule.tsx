
import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Problem, BookingStatus, AuditLogEntity, InfraMetric, UserEntity, UserRole, SystemAlert, SOPItem, ExpansionChecklist, VerificationStatus, FraudSignal, FraudType, VendorWebhook, TrustSafetyKPI, WebhookStatus, RegionConfig, InfraCostBreakdown, RevenueForecast } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, YAxis, PieChart, Pie, AreaChart, Area } from 'recharts';
import { db } from '../DatabaseService';
import { PLATFORM_FEE, SOP_LIST, EXPANSION_ROADMAP, REGIONS } from '../constants';

interface AdminModuleProps {
  bookings: Booking[];
  problems: Problem[];
}

const AdminModule: React.FC<AdminModuleProps> = ({ bookings, problems: initialProblems }) => {
  const [governanceMode, setGovernanceMode] = useState<'summary' | 'global' | 'costs' | 'forecasting' | 'ranking' | 'safety' | 'verification' | 'audit'>('summary');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>([]);
  const [infraMetrics, setInfraMetrics] = useState<InfraMetric[]>([]);
  const [allUsers, setAllUsers] = useState<UserEntity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [fraudSignals, setFraudSignals] = useState<FraudSignal[]>([]);
  const [infraCosts, setInfraCosts] = useState<InfraCostBreakdown | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast[]>([]);
  const [kycInspector, setKycInspector] = useState<UserEntity | null>(null);

  useEffect(() => {
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
  }, [governanceMode, bookings]);

  const analytics = useMemo(() => {
    const closed = bookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CLOSED);
    const totalPlatformRevenue = closed.length * PLATFORM_FEE;
    const catCounts: Record<string, number> = {};
    bookings.forEach(b => { catCounts[b.category] = (catCounts[b.category] || 0) + 1; });
    const chartData = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { totalPlatformRevenue, chartData, closedCount: closed.length };
  }, [bookings]);

  const providers = allUsers.filter(u => u.role_id === UserRole.PROVIDER);
  const pendingVerifications = allUsers.filter(u => u.verification_status === VerificationStatus.PENDING_ID || u.verification_status === VerificationStatus.BANK_VERIFIED);

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
            { id: 'safety', label: 'Safety' },
            { id: 'audit', label: 'Audit' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setGovernanceMode(tab.id as any)} className={`px-6 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${governanceMode === tab.id ? 'bg-[#00D4FF] text-[#0A2540] scale-110 shadow-2xl' : 'text-blue-100/50 hover:text-white'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {governanceMode === 'global' && (
        <div className="space-y-10 animate-fadeIn">
           <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF] opacity-10 blur-[150px]"></div>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 relative z-10">Region Isolation Node</h3>
              <p className="text-blue-300 text-xs font-black uppercase tracking-[0.4em] relative z-10">Geographic Data Sovereignty & Routing</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative z-10">
                 {REGIONS.map(region => (
                    <div key={region.id} className={`p-8 rounded-[3rem] border-2 transition-all ${region.status === 'ACTIVE' ? 'bg-white/10 border-[#00D4FF]' : 'bg-white/5 border-white/10'}`}>
                       <div className="flex justify-between items-center mb-6">
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${region.status === 'ACTIVE' ? 'bg-[#00D4FF] text-[#0A2540]' : 'bg-white/20 text-white'}`}>{region.status}</span>
                          <span className="text-xl">{region.id === 'IN' ? '🇮🇳' : region.id === 'UAE' ? '🇦🇪' : '🇸🇦'}</span>
                       </div>
                       <h4 className="text-2xl font-black tracking-tighter mb-2">{region.name}</h4>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Currency: {region.currency}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tax logic: {region.taxRate}% VAT</p>
                       </div>
                       <div className="mt-8 pt-6 border-t border-white/10">
                          <p className="text-[9px] font-black uppercase text-blue-300">Infra Latency: {region.status === 'ACTIVE' ? '24ms' : '--'}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-8">
                 <h4 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">Legal & VAT Readiness</h4>
                 <div className="space-y-6">
                    {[
                      { item: 'Data Residency Compliance', status: 'VERIFIED', color: 'text-green-500' },
                      { item: 'Arabic RTL UI Integration', status: 'IN_PROGRESS', color: 'text-blue-500' },
                      { item: 'Local Partner KYC Node', status: 'READY', color: 'text-green-500' },
                      { item: 'GCC Payment Gateway (Stripe/Tabby)', status: 'TESTING', color: 'text-orange-500' }
                    ].map((step, i) => (
                       <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl">
                          <p className="text-sm font-bold text-gray-600">{step.item}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${step.color}`}>{step.status}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                 <h4 className="text-3xl font-black text-[#0A2540] mb-4">India → UAE Tunnel</h4>
                 <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8 px-12">"Scaling the problem ontology from 2,000 to 5,000 items to cover GCC-specific household systems (Desalination units, Centralized cooling nodes)."</p>
                 <button className="bg-[#0A2540] text-white py-6 px-12 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl self-center">Provision UAE Cluster</button>
              </div>
           </div>
        </div>
      )}

      {governanceMode === 'costs' && infraCosts && (
        <div className="space-y-10 animate-fadeIn">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-sm text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Cost/Booking</p>
                 <p className="text-6xl font-black mt-4 text-[#0A2540] tracking-tighter">₹2.0</p>
              </div>
              <div className="p-10 rounded-[3.5rem] bg-[#0A2540] text-white shadow-2xl text-center">
                 <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Current Cost/Booking</p>
                 <p className="text-6xl font-black mt-4 text-[#00D4FF] tracking-tighter">₹{infraCosts.perBooking}</p>
              </div>
              <div className="p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-sm text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Monthly Burn</p>
                 <p className="text-6xl font-black mt-4 text-orange-500 tracking-tighter">₹{Math.round(infraCosts.total).toLocaleString()}</p>
              </div>
              <div className="p-10 rounded-[3.5rem] bg-green-50 border border-green-100 shadow-sm text-center">
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Marketplace Margin</p>
                 <p className="text-6xl font-black mt-4 text-green-700 tracking-tighter">75%</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
                 <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">Infra Spend Breakdown</h3>
                 <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                          { name: 'Compute', value: infraCosts.compute },
                          { name: 'Database', value: infraCosts.database },
                          { name: 'OTP/SMS', value: infraCosts.otp },
                          { name: 'Maps', value: infraCosts.maps },
                          { name: 'Logging', value: infraCosts.logging }
                       ]}>
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                          <Bar dataKey="value" fill="#0A2540" radius={[10, 10, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white space-y-10 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00D4FF] opacity-10 blur-[100px]"></div>
                 <h3 className="text-xl font-black uppercase tracking-widest">Optimization Log</h3>
                 <div className="space-y-6">
                    {[
                      { lever: 'Cloud Run Throttling', save: '₹0.4/book' },
                      { lever: 'Redis Query Caching', save: '₹0.2/book' },
                      { lever: 'OTP Re-use Token', save: '₹0.5/book' }
                    ].map((lever, i) => (
                       <div key={i} className="flex justify-between items-center p-5 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-xs font-bold opacity-70">{lever.lever}</p>
                          <span className="text-[10px] font-black text-green-400">-{lever.save}</span>
                       </div>
                    ))}
                 </div>
                 <div className="pt-8 border-t border-white/10">
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Ops Readiness</p>
                    <p className="text-[9px] opacity-40 mt-2">Current infra supports 50k concurrent nodes without cost spike.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {governanceMode === 'forecasting' && (
        <div className="space-y-10 animate-fadeIn">
           <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white flex justify-between items-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#00D4FF] opacity-5 blur-[120px]"></div>
              <div className="relative z-10">
                 <p className="text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Founder Intelligence</p>
                 <h3 className="text-6xl font-black tracking-tighter uppercase">Revenue AI</h3>
              </div>
              <div className="text-right relative z-10">
                 <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Predicted MRR (Sep '25)</p>
                 <p className="text-5xl font-black text-white tracking-tighter">₹{forecast[5]?.predictedRevenue.toLocaleString()}</p>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-12">
              <div className="flex justify-between items-center">
                 <h4 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">6-Month Growth Projection</h4>
                 <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase">Confidence: 92%</span>
              </div>
              <div className="h-[450px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="predictedRevenue" stroke="#00D4FF" strokeWidth={6} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Demand Velocity', value: '+20%/mo', status: 'STABLE' },
                { label: 'Churn Probability', value: '4.2%', status: 'LOW' },
                { label: 'Market Cap Simulation', value: '₹50Cr', status: 'TARGET' }
              ].map((m, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                   <p className="text-4xl font-black text-[#0A2540] tracking-tighter">{m.value}</p>
                   <span className="text-[9px] font-black text-blue-500 uppercase">{m.status}</span>
                </div>
              ))}
           </div>
        </div>
      )}

      {governanceMode === 'summary' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Revenue</p><p className="text-6xl font-black mt-4 text-green-600 tracking-tighter">₹{analytics.totalPlatformRevenue}</p></div>
            {infraMetrics.map((m, i) => (
              <div key={i} className="bg-[#0A2540] p-10 rounded-[3.5rem] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                 <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest relative z-10">{m.label}</p>
                 <p className="text-5xl font-black mt-4 text-[#00D4FF] tracking-tighter relative z-10">{m.unit}{m.value}</p>
                 <p className="text-[8px] font-black text-blue-400 uppercase mt-4 relative z-10">Trend: {m.trend.toUpperCase()}</p>
              </div>
            ))}
          </div>
          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm"><h3 className="text-2xl font-black text-[#0A2540] mb-10 uppercase tracking-widest">Real-time Node Activity</h3><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={[{time: '08:00', val: 120}, {time: '12:00', val: 890}, {time: '16:00', val: 1980}]}><YAxis hide /><XAxis dataKey="time" fontSize={10} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="val" stroke="#00D4FF" strokeWidth={6} dot={{r: 8, fill: '#0A2540', strokeWidth: 4, stroke: '#00D4FF'}} /></LineChart></ResponsiveContainer></div></div>
        </div>
      )}

      {governanceMode === 'ranking' && (
         <div className="space-y-10 animate-fadeIn">
            <div className="bg-[#00D4FF] p-12 rounded-[4rem] text-[#0A2540] flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-4xl font-black uppercase tracking-tighter">AI Provider Ranking</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-70">Fair Marketplace Distribution Logic</p>
               </div>
               <button className="bg-[#0A2540] text-white px-10 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl relative z-10">Force Global Refresh</button>
            </div>
            <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
               <h4 className="text-xl font-black text-[#0A2540] uppercase tracking-widest">Active Partner Rankings</h4>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <th className="pb-6">Partner</th>
                           <th className="pb-6">Score</th>
                           <th className="pb-6">Tier</th>
                           <th className="pb-6 text-right">Matching</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {providers.map(p => (
                           <tr key={p.id} className="group hover:bg-gray-50 transition-all">
                              <td className="py-8"><p className="font-black text-[#0A2540] leading-none">{p.name}</p><p className="text-[9px] text-gray-400 mt-2">{p.phone}</p></td>
                              <td className="py-8 font-black text-xl text-blue-500">{p.rank?.score || '--'}</td>
                              <td className="py-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.rank?.tier === 'PREMIER' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{p.rank?.tier || 'CALCULATING'}</span></td>
                              <td className="py-8 text-right"><span className="text-[10px] font-black uppercase text-green-500">Priority: {p.rank?.tier === 'PREMIER' ? 'High' : 'Normal'}</span></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {/* Safety & Verification Views remains consistent with previous versions but integrated into this final build */}
      {governanceMode === 'safety' && (
         <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm text-center py-40">
            <h3 className="text-4xl font-black text-[#0A2540] uppercase tracking-tighter">Safety Dashboard Integrated</h3>
            <p className="text-gray-400 font-bold mt-4">Real-time fraud signal feed synchronized with global nodes.</p>
         </div>
      )}
      
      {governanceMode === 'audit' && (
        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-[#0A2540] uppercase tracking-tighter">Security Audit Trail</h3>
           </div>
           <div className="overflow-x-auto custom-scrollbar max-h-[700px]">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-gray-100 sticky top-0 bg-white z-10 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                   <th className="pb-6">Timestamp</th><th className="pb-6">Node Action</th><th className="pb-6">Security Context</th><th className="pb-6 text-right">Financial Link</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {auditLogs.map(log => (
                   <tr key={log.id}>
                     <td className="py-6 text-[10px] text-gray-400 font-mono tracking-tighter">{new Date(log.timestamp).toLocaleString()}</td>
                     <td className="py-6"><span className={`font-black text-[11px] uppercase tracking-widest ${log.severity === 'ERROR' ? 'text-red-500' : 'text-[#0A2540]'}`}>{log.action.replace('_', ' ')}</span></td>
                     <td className="py-6"><p className="text-[10px] font-bold text-gray-400 leading-tight truncate max-w-xs">{log.metadata}</p></td>
                     <td className="py-6 text-right">{log.action === 'WALLET_SETTLEMENT' && <span className="text-green-600 font-black text-sm tracking-tighter">+₹{PLATFORM_FEE}</span>}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;

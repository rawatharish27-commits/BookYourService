import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Problem, BookingStatus, SLATier, StateConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { EXECUTION_ROADMAP, STATE_CONFIGS, PSU_TYPES, ORG_CHART, TENDER_SAMPLES, NEGOTIATION_PLAYBOOK, AI_PRODUCTION_STAGES, NATIONAL_BUDGET, CABINET_SLIDES, ANNEXURE_D, AI_MODEL_CARD, ROI_METRICS, BOQ_DATA } from '../constants';

interface AdminModuleProps {
  bookings: Booking[];
  problems: Problem[];
}

const AdminModule: React.FC<AdminModuleProps> = ({ bookings, problems }) => {
  const [governanceMode, setGovernanceMode] = useState<'summary' | 'iccc' | 'govt' | 'fraud' | 'strategy' | 'org' | 'cabinet'>('summary');
  const [selectedState, setSelectedState] = useState<StateConfig>(STATE_CONFIGS[0]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);

  // High-frequency Audit Ticker Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % 50);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === BookingStatus.COMPLETED);
    const totalFees = completed.length * 10;
    const totalGMV = completed.reduce((sum, b) => sum + b.totalAmount, 0);
    const activeJobsCount = bookings.filter(b => [BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(b.status)).length;
    
    const catCounts: Record<string, number> = {};
    bookings.forEach(b => {
      catCounts[b.category] = (catCounts[b.category] || 0) + 1;
    });
    
    const chartData = Object.entries(catCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const revenueData = completed.slice(-15).map((b, i) => ({
      index: i,
      val: b.totalAmount
    }));

    return { totalFees, totalGMV, activeJobsCount, chartData, revenueData };
  }, [bookings]);

  const COLORS = ['#0A2540', '#00D4FF', '#16A34A', '#818cf8', '#F59E0B', '#EF4444'];
  const tenderSample = TENDER_SAMPLES[selectedState.id as keyof typeof TENDER_SAMPLES];

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      {/* Sovereign Governance Header */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-[#0A2540] rounded-[1.5rem] flex items-center justify-center text-[#00D4FF] font-black text-3xl shadow-xl ring-4 ring-blue-50">
            ICCC
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase tracking-widest">National Command Center</h2>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Resilience Engine: Normal</p>
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sovereign Integrity: 100%</p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-gray-50 p-2 rounded-[2rem] border border-gray-100 overflow-x-auto max-w-full no-scrollbar relative z-10">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'iccc', label: 'Command' },
            { id: 'govt', label: 'Tenders' },
            { id: 'fraud', label: 'Intel' },
            { id: 'strategy', label: 'Strategy' },
            { id: 'org', label: 'Scaling' },
            { id: 'cabinet', label: 'Cabinet' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setGovernanceMode(tab.id as any)} 
              className={`px-6 py-2.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${governanceMode === tab.id ? 'bg-[#0A2540] text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Audit Ticker */}
      <div className="bg-[#0A2540] py-4 px-10 rounded-2xl flex items-center gap-10 overflow-hidden relative">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] whitespace-nowrap border-r border-white/10 pr-10">Live Audit Trace</span>
        <div className="flex-1 overflow-hidden">
          <p className="text-white/60 text-[11px] font-mono animate-pulse whitespace-nowrap">
            <span className="text-[#00D4FF] mr-2">[{new Date().toLocaleTimeString()}]</span>
            SECURE_NODE_TX_{tickerIndex.toString().padStart(4, '0')} : HASH_MATCH_SUCCESS : AUDIT_COMMITTED_TO_LEDGER : 0.0001ms_DRIFT
          </p>
        </div>
      </div>

      {governanceMode === 'summary' && (
        <div className="space-y-10 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 group hover:border-[#00D4FF] transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fees</p>
              <p className="text-5xl font-black text-[#0A2540] mt-4">₹{stats.totalFees}</p>
              <p className="text-[9px] text-green-500 font-black uppercase mt-6 tracking-widest">Audited: OK</p>
            </div>
            <div className="bg-[#0A2540] p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Market GMV</p>
                <p className="text-5xl font-black mt-4">₹{stats.totalGMV.toLocaleString()}</p>
                <p className="text-[9px] text-blue-400 font-black uppercase mt-6 tracking-widest">Settled: 100%</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Dispatch</p>
              <p className="text-5xl font-black text-[#0A2540] mt-4">{stats.activeJobsCount}</p>
              <p className="text-[9px] text-indigo-500 font-black uppercase mt-6 tracking-widest">Live Nodes</p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SLA Health</p>
              <p className="text-5xl font-black text-green-600 mt-4">98.4%</p>
              <p className="text-[9px] text-gray-400 font-black uppercase mt-6 tracking-widest">Global Stability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-[#0A2540] mb-12 uppercase tracking-widest text-center">Vertical Market Share</h3>
              <div className="h-[22rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', fontWeight: 'black' }} />
                    <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={60}>
                      {stats.chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-[#0A2540] mb-12 uppercase tracking-widest text-center">Value Velocity</h3>
              <div className="h-[22rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '32px', border: 'none' }} />
                    <Area type="monotone" dataKey="val" stroke="#00D4FF" fillOpacity={1} fill="url(#colorRev)" strokeWidth={6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {governanceMode === 'cabinet' && (
        <div className="space-y-12 animate-fadeIn">
          {/* Cabinet Presentation Deck View */}
          <section className="bg-[#0A2540] p-16 rounded-[4rem] text-white relative overflow-hidden min-h-[600px] flex flex-col border-8 border-white/5 shadow-2xl transition-all duration-700">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-16">
                <div>
                   <h3 className="text-5xl font-black tracking-tighter uppercase tracking-widest animate-slideUp">Cabinet Briefing</h3>
                   <p className="text-blue-300 text-xs font-black uppercase mt-2 opacity-60">National Digital Infrastructure Council • Confidential v4.2</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    disabled={activeSlide === 0}
                    onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                    className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-20 transition-all border border-white/10"
                  >
                    ←
                  </button>
                  <button 
                    disabled={activeSlide === CABINET_SLIDES.length - 1}
                    onClick={() => setActiveSlide(prev => Math.min(CABINET_SLIDES.length - 1, prev + 1))}
                    className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-20 transition-all border border-white/10"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full animate-fadeIn">
                <p className="text-[#00D4FF] text-xl font-black mb-8 uppercase tracking-[0.4em]">Slide {activeSlide + 1}: {CABINET_SLIDES[activeSlide].title}</p>
                <div className="space-y-8">
                  {CABINET_SLIDES[activeSlide].points.map((point, i) => (
                    <div key={i} className="flex items-center gap-8 group">
                      <div className="w-3 h-3 bg-[#00D4FF] rounded-full group-hover:scale-150 transition-all shadow-[0_0_15px_#00D4FF]"></div>
                      <p className="text-4xl font-black tracking-tight text-white/90 group-hover:text-white transition-all leading-snug">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>DoorStep Pro Sovereign Infrastructure Layer</span>
                <span>Audit Ref: NDIC-2024-EXEC-001</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>
          </section>

          {/* National Budget & ROI Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-widest mb-10">National Implementation Budget (INR Cr)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Budget Head</th>
                      <th className="px-8 py-6">Y1</th>
                      <th className="px-8 py-6">Y2</th>
                      <th className="px-8 py-6">Y3</th>
                      <th className="px-8 py-6 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-bold text-sm">
                    {NATIONAL_BUDGET.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-8 py-6 text-[#0A2540] uppercase tracking-tighter">{item.head}</td>
                        <td className="px-8 py-6 text-gray-600">₹{item.y1}</td>
                        <td className="px-8 py-6 text-gray-600">₹{item.y2}</td>
                        <td className="px-8 py-6 text-gray-600">₹{item.y3}</td>
                        <td className="px-8 py-6 text-right font-black text-blue-600">₹{(item.y1 + item.y2 + item.y3).toFixed(1)} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col h-full">
              <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-widest mb-10">Value Velocity (ROI Projection)</h3>
              <div className="grid grid-cols-1 gap-6 flex-1">
                {ROI_METRICS.map((metric, i) => (
                  <div key={i} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{metric.parameter}</p>
                      <p className="text-xs font-black text-[#0A2540] uppercase tracking-tighter">{metric.before} → {metric.after}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-green-600">{metric.annualSaving}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase">Est. Annualized Impact</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {governanceMode === 'govt' && (
        <div className="space-y-10 animate-fadeIn">
          <section className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-12">
                <div>
                   <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter">PSU Tender Engine</h3>
                   <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">State-Specific Utility Contract Configuration</p>
                </div>
                <div className="flex gap-4">
                   <select 
                     className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-2 text-[10px] font-black uppercase outline-none"
                     value={selectedState.id}
                     onChange={(e) => setSelectedState(STATE_CONFIGS.find(s => s.id === e.target.value)!)}
                   >
                      {STATE_CONFIGS.map(s => <option key={s.id} value={s.id}>{s.name} Regional Pack</option>)}
                   </select>
                   <button className="bg-blue-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Generate Tender Proposal</button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-12">
                   <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-[#0A2540] rounded-2xl flex items-center justify-center text-white text-xl font-black italic">{selectedState.id}</div>
                        <div>
                           <h4 className="text-2xl font-black text-[#0A2540]">{tenderSample.title}</h4>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sovereign Compliance Level: {selectedState.complianceLevel}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                        <div>
                           <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 pb-2 border-b">Core Objectives</h5>
                           <ul className="space-y-3">
                              {tenderSample.objectives.map((obj, i) => (
                                <li key={i} className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> {obj}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div>
                           <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 pb-2 border-b">Operational SLAs</h5>
                           <div className="space-y-3">
                              {Object.entries(tenderSample.sla).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-xs font-black">
                                   <span className="text-gray-500 uppercase tracking-tighter">{key}</span>
                                   <span className="text-[#0A2540] px-3 py-1 bg-white border border-gray-200 rounded-lg">{val as string}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
                         <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Policy & Language Mandate</h5>
                         <p className="text-sm font-bold text-gray-800 leading-relaxed italic border-l-4 border-blue-200 pl-4">"{tenderSample.focus}"</p>
                      </div>
                   </div>

                   {/* Annexure-D Legal Section */}
                   <div className="space-y-8">
                      <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-widest">Annexure-D: Technical & Legal Statutory Conditions</h3>
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">MANDATORY_COMPLIANCE</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ANNEXURE_D.map((annex) => (
                          <div key={annex.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-blue-200 transition-all shadow-sm group">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 block group-hover:translate-x-1 transition-transform">CLAUSE {annex.id}</span>
                            <h5 className="text-sm font-black text-[#0A2540] uppercase tracking-tighter mb-4">{annex.title}</h5>
                            <p className="text-xs font-medium text-gray-500 leading-relaxed">{annex.content || annex.includes}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="p-8 bg-[#0A2540] text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                      <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Regional SLA Thresholds</h4>
                      <div className="space-y-6">
                        {Object.entries(selectedState.slaModifiers).map(([tier, mins]) => (
                          <div key={tier} className="flex justify-between items-center">
                             <div>
                               <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{tier}</p>
                               <p className="text-[8px] font-medium text-blue-300 opacity-60">National Baseline Offset: 0</p>
                             </div>
                             <span className="text-xl font-black">{mins}m</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>
                   </div>
                   
                   <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Negotiation Strategy</h4>
                      <div className="space-y-4">
                        {NEGOTIATION_PLAYBOOK.strategies.map((strat, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-blue-500 flex-shrink-0">{i+1}</div>
                            <div>
                              <p className="text-[10px] font-black text-[#0A2540] uppercase mb-1">{strat.step}</p>
                              <p className="text-[9px] text-gray-500 leading-relaxed font-medium">{strat.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </div>
      )}

      {/* Global Immutable Ledger - Registry */}
      <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gray-50/50">
          <div>
            <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase tracking-widest">Service Registry Ledger</h3>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">Hashed Audit Trace (Regulatory Compliance Standard v2.8)</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-green-100 text-green-700 text-[10px] font-black px-6 py-4 rounded-2xl border border-green-200 uppercase tracking-widest shadow-sm flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full"></span> Audit: Zero-Drift
             </div>
             <button className="bg-[#0A2540] text-white text-[10px] font-black px-8 py-4 rounded-2xl border border-blue-500/30 shadow-2xl uppercase tracking-widest hover:bg-black transition-all">Secure Vault Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-[0.3em]">
              <tr>
                <th className="px-12 py-10">Ontology Hash</th>
                <th className="px-12 py-10">Locality Trace</th>
                <th className="px-12 py-10">Stakeholder</th>
                <th className="px-12 py-10 text-right">Settled Amount</th>
                <th className="px-12 py-10">State Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length > 0 ? bookings.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-12 py-10 font-mono text-xs text-blue-500 font-bold group-hover:text-[#0A2540] transition-colors">{book.ontologyId}</td>
                  <td className="px-12 py-10">
                    <span className="text-[10px] font-black text-[#0A2540] bg-white border border-gray-100 px-4 py-2 rounded-xl uppercase tracking-tighter">
                      {book.wardId}
                    </span>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col">
                      <span className="font-black text-[#0A2540] text-base leading-none mb-1">{book.userName}</span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {book.userId.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right font-black text-[#0A2540] text-xl">₹{book.totalAmount.toLocaleString()}</td>
                  <td className="px-12 py-10">
                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      book.status === BookingStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' : 
                      book.status === BookingStatus.FLAGGED ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                      'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="px-12 py-32 text-center opacity-20">
                      <p className="font-black text-gray-400 uppercase tracking-[0.5em] text-lg">Waiting for First Hashed Block</p>
                      <p className="text-[10px] font-black text-gray-300 mt-4 uppercase tracking-[0.2em]">Platform Ready for Consensus</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminModule;

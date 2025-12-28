
import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Problem, BookingStatus, LedgerEntry, UserRole, UserEntity, AuditLogEntity } from '../types';
import { db } from '../DatabaseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminModuleProps {
  bookings: Booking[];
  problems: Problem[];
}

const AdminModule: React.FC<AdminModuleProps> = ({ bookings, problems }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'settlement' | 'security' | 'users'>('analytics');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLedger(await db.getLedger());
      setUsers(await db.getUsers());
      setAuditLogs(await db.getLogs());
    };
    fetchData();
  }, [activeTab]);

  const securityThreats = useMemo(() => {
    return auditLogs.filter(l => l.severity === 'ERROR' || l.severity === 'CRITICAL');
  }, [auditLogs]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-20">
      <div className="bg-[#0A2540] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-3xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#00D4FF] rounded-2xl flex items-center justify-center text-[#0A2540] text-3xl font-black shadow-lg">M</div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Marketplace Controller</h2>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mt-2">Enterprise Security Node Active</p>
          </div>
        </div>
        <div className="flex gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {['analytics', 'settlement', 'security', 'users'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#00D4FF] text-[#0A2540] shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Image 1: Risks & Blindspots Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-red-500 text-2xl">🚨</span>
                  <span className="text-[10px] font-black text-red-500 uppercase">Critical Threats</span>
               </div>
               <p className="text-4xl font-black text-[#0A2540]">{securityThreats.length}</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">Active Intrusion Attempts</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-500 text-2xl">🔒</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase">JWT Sessions</span>
               </div>
               <p className="text-4xl font-black text-[#0A2540]">{users.length}</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">Active Verified Tokens</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-green-50">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-green-500 text-2xl">🛡️</span>
                  <span className="text-[10px] font-black text-green-500 uppercase">Lateral Breach Protection</span>
               </div>
               <p className="text-4xl font-black text-[#0A2540]">Active</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">RBAC Nodes Synced</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black text-[#0A2540] uppercase mb-8">Live Threat Feed (Image 1)</h3>
             <div className="space-y-4">
                {securityThreats.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No Active API Threats Detected</div>
                ) : (
                  securityThreats.map(log => (
                    <div key={log.id} className="p-6 bg-red-50 border border-red-100 rounded-3xl flex justify-between items-center animate-pulse">
                       <div>
                          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{log.severity} ATTACK DETECTED</p>
                          <h4 className="font-black text-[#0A2540] uppercase text-sm">{log.action}</h4>
                          <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Node: {log.entity} • User: {log.user_id}</p>
                       </div>
                       <button className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase">Neutralize</button>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Revenue Growth (Daily)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#0A2540" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Service Mix</h3>
             {/* Chart placeholder */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;


import React, { useState, useMemo } from 'react';
import { Problem, User } from '../types';
import { CATEGORIES } from '../constants';
import { customerService } from '../services/CustomerService';
import { bookingService } from '../services/BookingService';

interface Props { problems: Problem[]; user: User; }

const DashboardModule: React.FC<Props> = ({ problems, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Problem | null>(null);

  const filtered = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
  }, [searchTerm, problems]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
         <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase">Book<br/><span className="text-blue-500">Service.</span></h1>
         <div className="w-12 h-12 bg-[#0A2540] text-white rounded-2xl flex items-center justify-center font-black">{user.name[0]}</div>
      </div>

      <div className="space-y-4">
        <input 
          placeholder="Search 2,000+ service nodes..." 
          className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl font-bold shadow-sm outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {filtered.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden divide-y divide-slate-50 border border-slate-100">
             {filtered.map(p => (
               <button key={p.id} onClick={() => setSelected(p)} className="w-full p-6 text-left hover:bg-slate-50 flex justify-between items-center group">
                 <span className="font-black text-xs uppercase tracking-tight text-slate-600 group-hover:text-blue-600">{p.title}</span>
                 <span className="font-black text-blue-600">₹{p.basePrice}</span>
               </button>
             ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
         {CATEGORIES.map(c => (
           <button key={c.id} onClick={() => setSearchTerm(c.name)} className="flex flex-col items-center gap-2 group">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {c.icon}
             </div>
             <p className="text-[8px] font-black uppercase text-slate-400 text-center">{c.name}</p>
           </button>
         ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-[#0A2540]/90 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-white rounded-[4rem] p-10 w-full space-y-8 shadow-3xl text-center">
              <h3 className="text-3xl font-black text-[#0A2540] italic uppercase">{selected.title}</h3>
              <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center">
                 <div className="text-left"><p className="text-[10px] font-black text-slate-400">Locked Base</p><p className="text-2xl font-black text-blue-600">₹{selected.basePrice}</p></div>
                 <div className="text-right"><p className="text-[10px] font-black text-slate-400">Max Cap</p><p className="text-2xl font-black text-slate-300 italic">₹{selected.maxPrice}</p></div>
              </div>
              <button onClick={async () => {
                await bookingService.create(user.id, selected, user.city);
                setSelected(null);
                setSearchTerm('');
                alert("Dispatch node triggered!");
              }} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Confirm Dispatch</button>
              <button onClick={() => setSelected(null)} className="text-slate-400 font-bold uppercase text-xs">Back</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardModule;

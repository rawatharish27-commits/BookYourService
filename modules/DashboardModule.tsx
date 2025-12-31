import React, { useState, useMemo } from 'react';
import { Problem, User, BookingStatus } from '../types';
import { CATEGORIES } from '../constants';
import { bookingService } from '../services/BookingService';
import { visualAI } from '../services/VisualDiagnosticsService';

interface Props { problems: Problem[]; user: User; }

const DashboardModule: React.FC<Props> = ({ problems, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Problem | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const filtered = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
  }, [searchTerm, problems]);

  const handleVisualScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await visualAI.analyzeProblemImage(base64, file.type);
        if (result.suggestedProblem) {
          setSelected(result.suggestedProblem);
        } else {
          alert("Visual AI inconclusive. Please search manually.");
        }
      } catch (err) {
        alert("AI Diagnostic Node unreachable.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-8 space-y-10 font-inter">
      <header className="flex justify-between items-end">
         <div>
            <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em]">Client Hub</p>
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase leading-none italic">DoorStep<br/>Pro.</h1>
         </div>
         <label className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-xl shadow-2xl cursor-pointer hover:scale-110 transition-transform">
            {isScanning ? <span className="animate-pulse">⏳</span> : '📷'}
            <input type="file" accept="image/*" className="hidden" onChange={handleVisualScan} />
         </label>
      </header>

      <div className="space-y-4">
        <input 
          placeholder="Search 2,000+ service nodes..." 
          className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl font-bold shadow-sm outline-none focus:border-blue-500 text-[#0A2540]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {filtered.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden divide-y divide-slate-50 border border-slate-100 animate-slideUp">
             {filtered.map(p => (
               <button key={p.id} onClick={() => setSelected(p)} className="w-full p-6 text-left hover:bg-slate-50 flex justify-between items-center group">
                 <div className="space-y-1">
                    <p className="font-black text-[11px] uppercase tracking-tight text-[#0A2540] group-hover:text-blue-600 transition-colors">{p.title}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</p>
                 </div>
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
             <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-widest leading-tight">{c.name}</p>
           </button>
         ))}
      </div>

      <div className="bg-[#0A2540] p-10 rounded-[3rem] text-white space-y-2 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
         <p className="text-[9px] font-black uppercase text-blue-400 tracking-[0.4em]">Governance node</p>
         <h3 className="text-xl font-black italic tracking-tighter">Guaranteed Fulfillment.</h3>
         <p className="text-[10px] text-white/40 font-medium">Standardized pricing nodes ensure zero bargaining and high-fidelity service delivery.</p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-[#0A2540]/90 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-white rounded-[4rem] p-12 w-full max-w-sm space-y-10 shadow-3xl text-center animate-slideUp">
              <div className="space-y-4">
                <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{selected.category}</span>
                <h3 className="text-3xl font-black text-[#0A2540] italic uppercase tracking-tighter">{selected.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">SLA Node: {selected.slaTier} Standard Compliance</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[3rem] flex justify-between items-center border border-slate-100">
                 <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase">System Lock</p><p className="text-3xl font-black text-blue-600 tracking-tighter">₹{selected.basePrice}</p></div>
                 <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">Max Cap</p><p className="text-xl font-black text-slate-300 italic tracking-tighter">₹{selected.maxPrice}</p></div>
              </div>
              <button onClick={async () => {
                await bookingService.create(user.id, selected, user.city);
                setSelected(null);
                setSearchTerm('');
                alert("Dispatch node triggered successfully!");
              }} className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-colors">Confirm Dispatch</button>
              <button onClick={() => setSelected(null)} className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Back to Interface</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardModule;
import React from 'react';

const PricingModule: React.FC = () => {
  // Fix: Explicitly initialize price constants to avoid syntax errors in object literals
  const basicPrice = 499;
  const proPrice = 999;

  const plans = [
    {
      name: "Basic Hub",
      price: basicPrice,
      features: ["SLA Monitoring", "Standard Dispatch"]
    },
    {
      name: "Pro Hub",
      price: proPrice,
      features: ["Priority Dispatch", "Forensic Auditing", "AI Diagnostics"]
    }
  ];

  return (
    <div className="p-8 space-y-8 font-inter">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-[#0A2540] uppercase italic tracking-tighter">Price Ontology</h2>
        <p className="text-slate-400 text-sm font-medium">Global price lock and regional adjustment nodes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map(plan => (
          <div key={plan.name} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#0A2540] italic uppercase">{plan.name}</h3>
              <p className="text-4xl font-black text-blue-600 tracking-tighter">₹{plan.price}</p>
            </div>
            <ul className="space-y-3">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase italic">
                  <span className="text-blue-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#0A2540] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Activate Node</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingModule;
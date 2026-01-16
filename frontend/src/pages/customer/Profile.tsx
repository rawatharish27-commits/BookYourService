/**
 * Customer Profile Page - View and edit profile
 */
import React from 'react';

const CustomerProfile: React.FC = () => {
  const user = { name: 'John Doe', phone: '+91 98765 43210', email: 'john@example.com', city: 'Mumbai', joined: 'October 2024' };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#0A2540] italic">My Profile</h1>
      
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-[#0A2540] rounded-[2rem] flex items-center justify-center text-4xl text-white font-black italic">J</div>
          <div>
            <h2 className="text-2xl font-bold text-[#0A2540]">{user.name}</h2>
            <p className="text-slate-400">{user.joined}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
            <input type="text" value={user.phone} className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold" readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input type="text" value={user.email} className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold" readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">City</label>
            <input type="text" value={user.city} className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold" readOnly />
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
          <button className="px-6 py-3 bg-[#0A2540] text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Edit Profile</button>
          <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;


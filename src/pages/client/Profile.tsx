import React from 'react';
import Seo from "../../components/seo/Seo";
import { User, Mail, Phone, Camera, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <Seo title="My Profile" description="Manage your profile information" />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Account <span className="text-indigo-600">Settings</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Avatar & Side Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 font-black text-3xl border border-indigo-100">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-2 rounded-xl shadow-lg border-2 border-white hover:bg-indigo-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.role} Account</p>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 opacity-80" />
                    <h3 className="font-bold">Privacy First</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-80">Your contact details are encrypted and shared only with verified professionals during an active booking.</p>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                      placeholder="Full Name"
                      defaultValue={user?.name}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                      placeholder="Email"
                      defaultValue={user?.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <button className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" /> Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
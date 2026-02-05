import React from 'react';
import Seo from "../../components/seo/Seo";
import useNotifications from "../../hooks/useNotifications";
import { Bell, Calendar, DollarSign, UserCheck, ChevronRight, Info, Settings, Wifi, WifiOff, Clock } from 'lucide-react';
import { StatusBadge } from "../../components/StatusBadge";

export default function Notifications() {
  const { notifications, isConnected } = useNotifications();

  return (
    <>
      <Seo title="Live Activity" description="Stay updated with your service activity" noIndex />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Bell className="w-8 h-8 text-indigo-600" /> Live <span className="text-indigo-600">Activity</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {isConnected ? 'Connected to Ledger' : 'Reconnecting...'}
                </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-colors shadow-sm">
                <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-200">
                    <Bell className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No updates yet</h3>
                <p className="text-sm text-gray-500 max-w-xs font-medium">Real-time alerts for bookings, payments and system status will appear here as they happen.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                <div key={n.id} className="p-8 flex items-start gap-6 hover:bg-gray-50/50 transition-all cursor-pointer group relative">
                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>}
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        n.type === 'BOOKING' ? 'bg-indigo-50 text-indigo-600' : 
                        n.type === 'PAYMENT' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                        {n.type === 'BOOKING' ? <Calendar className="w-7 h-7" /> : 
                         n.type === 'PAYMENT' ? <DollarSign className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{n.title}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{n.message}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 self-center group-hover:translate-x-1 transition-transform" />
                </div>
                ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-8 bg-gray-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Wifi className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h4 className="font-black text-lg">Push Protocol Active</h4>
                    <p className="text-xs text-gray-400 font-medium">You are receiving real-time state machine updates.</p>
                </div>
            </div>
            <button className="relative z-10 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-white transition-colors">Clear History</button>
        </div>
      </div>
    </>
  );
}
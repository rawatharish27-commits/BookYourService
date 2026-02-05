import React, { useEffect, useState } from 'react';
import { Booking, Role, BookingStatus } from '../../types';
import { getBookings, startJob, completeJob, api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { XCircle, Play, CheckSquare, Loader2, Calendar, User, MapPin, BellRing, CheckCircle, Ban, CheckCircle2 } from 'lucide-react';

export const ProviderBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const data = await getBookings(Role.PROVIDER);
        setBookings(data);
    } catch (e) {
        // Handled globally
    } finally {
        setLoading(false);
    }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
      const msg = action === 'accept' ? "Do you want to accept this job?" : "Are you sure you want to REJECT? This will reassign the job to another pro.";
      if (!window.confirm(msg)) return;

      try {
          await api.post(`/api/v1/bookings/${id}/${action}`, { reason: "Provider Manual Response" });
          showToast(action === 'accept' ? "Job Accepted!" : "Job Rejected", 'success');
          fetchBookings();
      } catch (e: any) {
          showToast(e.response?.data?.message || "Action failed", 'error');
      }
  };

  const handleStart = async (id: string) => {
    try {
        await startJob(id);
        showToast("Job Started!", 'success');
        fetchBookings();
    } catch (e: any) { showToast(e.response?.data?.message, 'error'); }
  };

  const handleComplete = async (id: string) => {
    if (window.confirm("Mark this job as complete? This notifies the customer to confirm.")) {
        try {
            await api.post(`/api/v1/bookings/${id}/complete-provider`);
            showToast("Job marked as completed. Awaiting customer confirmation.", 'success');
            fetchBookings();
        } catch (e: any) { showToast(e.response?.data?.message, 'error'); }
    }
  };

  // --- Filtering Logic ---
  const requests = bookings.filter(b => [BookingStatus.PROVIDER_ASSIGNED, BookingStatus.PROVIDER_ACCEPTED].includes(b.status));
  const active = bookings.filter(b => [BookingStatus.IN_PROGRESS, BookingStatus.PROVIDER_COMPLETED].includes(b.status));
  const history = bookings.filter(b => [BookingStatus.CUSTOMER_CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REFUNDED, BookingStatus.SETTLED].includes(b.status));

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 pt-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Job <span className="text-indigo-600">Pipeline</span></h2>
          <p className="text-gray-500 font-medium mt-1">Manage your active service queue.</p>
        </div>
        <button onClick={fetchBookings} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">Refresh</button>
      </div>

      {/* TABS */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-10 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'requests' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
              New & Upcoming
              {requests.length > 0 && <span className="bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full">{requests.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
              Active Jobs
              {active.length > 0 && <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full">{active.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
              Past History
          </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-32">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10"/>
        </div>
      ) : (
        <div className="space-y-6">
            {/* --- TAB: NEW & UPCOMING --- */}
            {activeTab === 'requests' && (
                <>
                    {requests.length === 0 && (
                         <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                             <BellRing className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                             <p className="text-gray-400 font-bold">No new assignments detected.</p>
                         </div>
                    )}
                    {requests.map(b => (
                        <div key={b.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between gap-8 hover:border-indigo-200 transition-all group">
                             <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-6">
                                     <StatusBadge status={b.status} />
                                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: #{b.id.slice(0,8)}</span>
                                 </div>
                                 <h3 className="text-2xl font-black text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors">{b.serviceTitle}</h3>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                         <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><User className="w-4 h-4" /></div>
                                         {b.clientName}
                                     </div>
                                     <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                         <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><MapPin className="w-4 h-4" /></div>
                                         <span className="truncate">{b.address}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col gap-3 justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8">
                                 <div className="text-center mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Payout</p>
                                    <span className="text-3xl font-black text-gray-900">₹{b.total_amount}</span>
                                 </div>

                                 {b.status === BookingStatus.PROVIDER_ASSIGNED ? (
                                     <div className="flex flex-col gap-2">
                                         <button 
                                            onClick={() => handleRespond(b.id, 'accept')}
                                            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
                                         >
                                            <CheckCircle className="w-5 h-5" /> Accept Job
                                         </button>
                                         <button 
                                            onClick={() => handleRespond(b.id, 'reject')}
                                            className="w-full bg-white text-red-500 font-black py-3 rounded-2xl border border-red-50 hover:bg-red-50 transition-all text-xs uppercase tracking-widest"
                                         >
                                            <Ban className="w-4 h-4 mr-2 inline" /> Reject assignment
                                         </button>
                                     </div>
                                 ) : (
                                     <button 
                                        onClick={() => handleStart(b.id)}
                                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                                     >
                                        <Play className="w-5 h-5 fill-current" /> Arrived & Start
                                     </button>
                                 )}
                             </div>
                        </div>
                    ))}
                </>
            )}

            {/* --- TAB: ACTIVE --- */}
            {activeTab === 'active' && (
                <div className="space-y-4">
                     {active.length === 0 && (
                         <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold italic">No jobs currently in progress.</p>
                         </div>
                     )}
                     {active.map(b => (
                         <div key={b.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                             <div className="flex items-center gap-6">
                                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden ${b.status === BookingStatus.PROVIDER_COMPLETED ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                     {b.status === BookingStatus.PROVIDER_COMPLETED ? <CheckCircle2 className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current animate-pulse" />}
                                 </div>
                                 <div>
                                     <h3 className="font-black text-gray-900 text-xl">{b.serviceTitle}</h3>
                                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Client: {b.clientName}</p>
                                 </div>
                             </div>
                             
                             {b.status === BookingStatus.IN_PROGRESS ? (
                                <button 
                                    onClick={() => handleComplete(b.id)} 
                                    className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700 px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                                >
                                    <CheckSquare className="w-6 h-6" /> Finish Job
                                </button>
                             ) : (
                                <div className="bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-xl">
                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest text-center">Awaiting customer confirm</p>
                                </div>
                             )}
                         </div>
                     ))}
                </div>
            )}

            {/* --- TAB: HISTORY --- */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.length === 0 ? (
                                <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold italic">No history items.</td></tr>
                            ) : history.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6 text-sm font-black text-gray-900">{b.serviceTitle}</td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-400 uppercase">{new Date(b.scheduled_time).toLocaleDateString()}</td>
                                    <td className="px-8 py-6"><StatusBadge status={b.status} /></td>
                                    <td className="px-8 py-6 text-right font-black text-gray-900">₹{b.total_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
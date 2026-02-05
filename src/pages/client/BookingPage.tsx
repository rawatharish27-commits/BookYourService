import React, { useEffect, useState, lazy, Suspense, useTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubCategoryDetailsBySlug, getZonesFallback, createBooking, api } from '../../services/api';
import { Zone } from '../../types';
import { ArrowLeft, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import Seo from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';

const SlotSelector = lazy(() => import('../../components/booking/SlotSelector'));

export const BookingPage: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string, subCategorySlug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!categorySlug || !subCategorySlug) return;
    const init = async () => {
        setLoading(true);
        try {
            const [z, d] = await Promise.all([
                getZonesFallback(),
                getSubCategoryDetailsBySlug(categorySlug, subCategorySlug, selectedZone)
            ]);
            setZones(z);
            setDetails(d);
            if (d.availability?.zone_id) setSelectedZone(d.availability.zone_id);
        } catch(e) { 
            showToast("Failed to load service details", "error");
        } finally { 
            setLoading(false); 
        }
    };
    init();
  }, [categorySlug, subCategorySlug, selectedZone, showToast]);

  useEffect(() => {
    if (!date || !details?.id) return;
    const fetchSlots = async () => {
        try {
            const res = await api.get(`/api/v1/availability/slots?subCategoryId=${details.id}&date=${date}&zoneId=${selectedZone}`);
            setAvailableSlots(res.data.slots || []);
            setTimeSlot(''); 
        } catch (e) {
            setAvailableSlots([]);
        }
    };
    fetchSlots();
  }, [date, details?.id, selectedZone]);

  const handleBooking = async () => {
    if (!date || !timeSlot || !address) {
        showToast("Please fill all required fields", "error");
        return;
    }
    setSubmitting(true);
    const dateTime = `${date}T${timeSlot}:00Z`;
    try {
        const res = await createBooking({
            subCategoryId: Number(details.id),
            zoneId: Number(selectedZone),
            date: dateTime,
            address,
            notes
        });
        
        startTransition(() => {
            showToast("Slot reserved! Proceed to secure payment.", "success");
            // PHASE 3: Navigate to Payment Page instead of direct dashboard
            navigate(`/payments/${res.booking.id}`);
        });
    } catch (e: any) {
        showToast(e.response?.data?.message || "Slot no longer available", "error");
        setSubmitting(false);
    }
  };

  if (loading || isPending) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Seo title="Confirm Booking" description="Schedule your professional service and reserve your time slot." />
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Reserve Expert</h1>
                    <p className="text-gray-500 font-medium mb-10">Select a convenient time for your {details?.name}.</p>
                    
                    <div className="space-y-12">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">1. Preferred Date</label>
                            <input 
                                type="date"
                                min={today}
                                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 shadow-inner"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">2. Available Windows</label>
                            {!date ? (
                                <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl text-center text-gray-400 font-bold text-sm bg-gray-50/30">
                                    Please select a date to fetch live professional availability.
                                </div>
                            ) : (
                                <Suspense fallback={<div className="h-48 flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse">Scanning provider calendars...</div>}>
                                <SlotSelector 
                                    slots={availableSlots} 
                                    selectedSlot={timeSlot} 
                                    onSelect={setTimeSlot} 
                                />
                                </Suspense>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">3. Service Location</label>
                            <div className="space-y-4">
                                <textarea 
                                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none font-bold text-gray-900 shadow-inner"
                                    placeholder="Enter full doorstep address..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                />
                                <input 
                                    type="text"
                                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 shadow-inner"
                                    placeholder="Any landmark or entry notes? (optional)"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 p-8 sticky top-24 border border-indigo-50">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-600" /> Summary
                    </h2>
                    
                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Starting From</span>
                            <span className="text-2xl font-black text-gray-900">₹{details?.startingPrice || 0}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                            Final price will be calculated after expert inspection on-site.
                        </p>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-8">
                         <div className="flex gap-3">
                             <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                             <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-tighter">
                                Slot will be locked for 15 minutes while you complete payment.
                             </p>
                         </div>
                    </div>

                    <button 
                        onClick={handleBooking}
                        disabled={submitting || !timeSlot || !address}
                        className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Pay'}
                    </button>
                    
                    <p className="mt-6 text-[10px] text-gray-400 font-bold text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Secure Transaction
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
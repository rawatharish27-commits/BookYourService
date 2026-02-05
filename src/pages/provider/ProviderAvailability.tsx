
import React, { useState, useEffect, useCallback } from "react";
import Seo from "../../components/seo/Seo";
import WeeklyAvailability from "../../components/provider/WeeklyAvailability";
import { Calendar, Save, Info, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { getAvailability, setAvailability } from "../../services/api";
import Loader from "../../components/ui/Loader";

const DAY_DATA = [
  { day: "Monday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Tuesday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Wednesday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Thursday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Friday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Saturday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { day: "Sunday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
];

const DAY_MAP: Record<string, number> = {
    "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
};

export default function ProviderAvailability() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlots, setActiveSlots] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchCurrent = async () => {
        try {
            // Fix: explicitly cast data to any[] to avoid "unknown" type error on forEach call below
            const data = (await getAvailability()) as any[];
            const mapped: Record<string, string[]> = {};
            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    const dayName = Object.keys(DAY_MAP).find(key => DAY_MAP[key] === item.day_of_week);
                    if (dayName) {
                        if (!mapped[dayName]) mapped[dayName] = [];
                        mapped[dayName].push(item.start_time.substring(0, 5));
                    }
                });
            }
            setActiveSlots(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchCurrent();
  }, []);

  const toggleSlot = useCallback((day: string, slot: string) => {
    setActiveSlots(prev => {
        const daySlots = prev[day] || [];
        if (daySlots.includes(slot)) {
            return { ...prev, [day]: daySlots.filter(s => s !== slot) };
        } else {
            return { ...prev, [day]: [...daySlots, slot] };
        }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
        const payload: { day: number, start: string, end: string }[] = [];
        Object.entries(activeSlots).forEach(([dayName, slots]) => {
            // Fix: Explicitly cast slots as string[] to resolve "Property 'forEach' does not exist on type 'unknown'" error on line 72
            (slots as string[]).forEach(startTime => {
                const hour = parseInt(startTime.split(':')[0]);
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                payload.push({
                    day: DAY_MAP[dayName],
                    start: `${startTime}:00`,
                    end: `${endTime}:00`
                });
            });
        });

        await setAvailability({ slots: payload } as any);
        showToast("Weekly availability updated successfully!", "success");
    } catch (e: any) {
        showToast(e.response?.data?.message || "Failed to save schedule", "error");
    } finally {
        setSaving(false);
    }
  };

  return (
    <>
      <Seo
        title="Weekly Schedule"
        description="Manage your working hours and availability grid"
        noIndex
      />

      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/provider')} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        Weekly <span className="text-indigo-600">Availability</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Select the time slots you are available for work.</p>
                </div>
            </div>
            
            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-gray-900 text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
            >
                {saving ? < Zap className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
            </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm shrink-0">
                <Info className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
                <h4 className="font-black text-indigo-900 text-lg">Pro-Assigner Protocol</h4>
                <p className="text-indigo-700 text-sm leading-relaxed font-medium">
                    The auto-assign engine only considers slots marked in <span className="font-black">Purple</span>. 
                    Marking yourself available ensures you stay in the high-priority queue for upcoming jobs in your zone.
                </p>
            </div>
        </div>

        {loading ? (
            <div className="py-32 text-center">
                <Loader />
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WeeklyAvailability
                    data={DAY_DATA}
                    activeSlots={activeSlots}
                    onToggle={toggleSlot}
                />
            </div>
        )}

        <div className="flex justify-center pt-10">
             <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 text-white font-black py-5 px-16 rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
                Update Schedule
            </button>
        </div>
      </div>
    </>
  );
}

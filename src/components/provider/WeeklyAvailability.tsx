import React, { memo } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface DayAvailability {
  day: string;
  slots: string[];
}

interface WeeklyAvailabilityProps {
  data: DayAvailability[];
  activeSlots: Record<string, string[]>; // day -> array of slot strings
  onToggle: (day: string, slot: string) => void;
}

function WeeklyAvailability({
  data,
  activeSlots,
  onToggle,
}: WeeklyAvailabilityProps) {
  return (
    <div className="space-y-8">
      {data.map((day) => (
        <div key={day.day} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">{day.day}</h3>
            <div className="h-px flex-1 bg-gray-50"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {day.slots.map((slot) => {
              const isActive = activeSlots[day.day]?.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => onToggle(day.day, slot)}
                  className={`
                    group relative p-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${isActive 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                    }
                  `}
                >
                  <Clock className={`w-3.5 h-3.5 ${isActive ? "text-indigo-200" : "text-gray-300 group-hover:text-indigo-400"}`} />
                  {slot}
                  {isActive && (
                    <div className="absolute -top-2 -right-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 fill-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(WeeklyAvailability);
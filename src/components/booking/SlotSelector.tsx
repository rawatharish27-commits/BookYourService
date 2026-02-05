import React from 'react';
import { Clock } from 'lucide-react';

interface Slot {
  label: string;
  value: string;
  isAvailable: boolean;
}

interface SlotSelectorProps {
  slots: Slot[];
  selectedSlot: string;
  onSelect: (value: string) => void;
}

export default function SlotSelector({ slots, selectedSlot, onSelect }: SlotSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {slots.map((slot) => (
        <button
          key={slot.value}
          disabled={!slot.isAvailable}
          onClick={() => onSelect(slot.value)}
          className={`
            flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200
            ${!slot.isAvailable 
              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50' 
              : selectedSlot === slot.value
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100'
                : 'border-gray-100 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/30'
            }
          `}
        >
          <Clock className={`w-4 h-4 mb-2 ${selectedSlot === slot.value ? 'text-indigo-600' : 'text-gray-400'}`} />
          <span className="text-sm font-bold">{slot.label}</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">
            {slot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </button>
      ))}
    </div>
  );
}
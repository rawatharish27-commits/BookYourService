import React from 'react';
import { CheckCircle, Clock, CreditCard, Play, PackageCheck } from 'lucide-react';
import { BookingStatus } from '../../types';

interface BookingTimelineProps {
  currentStatus: BookingStatus;
}

export default function BookingTimeline({ currentStatus }: BookingTimelineProps) {
  const steps = [
    { id: 'CONFIRMED', label: 'Booked', icon: CheckCircle },
    { id: 'PAYMENT_PENDING', label: 'Payment', icon: CreditCard },
    { id: 'PROVIDER_ASSIGNED', label: 'Assigned', icon: Clock },
    { id: 'IN_PROGRESS', label: 'On Job', icon: Play },
    { id: 'COMPLETED', label: 'Finished', icon: PackageCheck },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStatus);
  const visualIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="relative flex justify-between items-center w-full max-w-lg mx-auto py-8">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2"></div>
      
      {/* Progress Line */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-1000 ease-in-out"
        style={{ width: `${(visualIdx / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, idx) => {
        const isCompleted = idx <= visualIdx;
        const isCurrent = idx === visualIdx;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4
                ${isCompleted ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg' : 'bg-white border-gray-50 text-gray-300'}
                ${isCurrent ? 'ring-4 ring-indigo-50 animate-pulse' : ''}
              `}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${isCompleted ? 'text-indigo-900' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
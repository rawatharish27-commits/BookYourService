
import React from 'react';
import { BookingStatus } from '../types';

interface Props {
  status: BookingStatus | 'APPROVED' | 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let label = status.replace('_', ' ');

  // UX ENHANCEMENT: Friendly Labels
  switch (status) {
    case BookingStatus.INITIATED:
    case BookingStatus.SLOT_LOCKED:
    case BookingStatus.PAYMENT_PENDING:
      colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      label = 'Awaiting Payment';
      break;
    case BookingStatus.CONFIRMED:
    case BookingStatus.PROVIDER_ASSIGNED:
      colorClass = 'bg-blue-100 text-blue-800 border border-blue-200';
      label = 'Confirmed';
      break;
    case BookingStatus.IN_PROGRESS:
      colorClass = 'bg-purple-100 text-purple-800 border border-purple-200';
      label = 'In Progress';
      break;
    case BookingStatus.COMPLETED:
    case BookingStatus.SETTLED:
      colorClass = 'bg-green-100 text-green-800 border border-green-200';
      label = 'Completed';
      break;
    case BookingStatus.CANCELLED:
    case BookingStatus.FAILED:
      colorClass = 'bg-red-100 text-red-800 border border-red-200';
      label = 'Cancelled';
      break;
    case BookingStatus.REFUNDED:
      colorClass = 'bg-gray-100 text-gray-600 border border-gray-300';
      label = 'Refunded';
      break;
    
    // Service Statuses
    case 'APPROVED':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'PENDING_APPROVAL':
      colorClass = 'bg-orange-100 text-orange-800';
      label = 'Waiting Approval';
      break;
    case 'ACTIVE':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'INACTIVE':
      colorClass = 'bg-gray-100 text-gray-600';
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${colorClass} inline-flex items-center`}>
      {status === BookingStatus.IN_PROGRESS && <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>}
      {label}
    </span>
  );
};

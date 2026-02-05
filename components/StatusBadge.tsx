import React from 'react';
import { BookingStatus } from '../types';

interface Props {
  status: BookingStatus | 'APPROVED' | 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';

  switch (status) {
    case BookingStatus.ACCEPTED:
    case BookingStatus.IN_PROGRESS:
    case 'ACTIVE':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case BookingStatus.COMPLETED:
    case 'APPROVED':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case BookingStatus.CANCELLED:
    case 'INACTIVE':
      colorClass = 'bg-red-100 text-red-800';
      break;
    case BookingStatus.PENDING:
    case 'PENDING_APPROVAL':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

import React, { useEffect, useState } from 'react';
import { getDisputes, resolveDispute } from '../../services/api';
import { Scale, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const DisputeManager: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
        const data = await getDisputes();
        setDisputes(data);
        setLoading(false);
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (id: string, outcome: string) => {
      const notes = prompt("Enter resolution notes (Required for audit):");
      if (!notes) return;

      if(window.confirm(`Are you sure you want to resolve as ${outcome}? This involves financial transactions.`)) {
          try {
              await resolveDispute({ disputeId: id, outcome, notes });
              alert("Dispute Resolved");
              fetchDisputes();
          } catch(e: any) { alert("Error: " + e.response?.data?.message); }
      }
  };

  if (loading) return <div className="p-8">Loading disputes...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-700" />
            <h3 className="font-bold text-red-900">Dispute Resolution Center</h3>
        </div>

        {disputes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No active disputes.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initiator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Decision</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {disputes.map(d => (
                            <tr key={d.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{d.initiator_name}</div>
                                    <div className="text-xs text-gray-500">Booking: {d.booking_id}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">${d.total_amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{d.reason}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {d.status === 'OPEN' && (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleResolve(d.id, 'RESOLVED_CLIENT')}
                                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-xs font-bold"
                                            >
                                                Refund Client
                                            </button>
                                            <button 
                                                onClick={() => handleResolve(d.id, 'RESOLVED_PROVIDER')}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold"
                                            >
                                                Pay Provider
                                            </button>
                                        </div>
                                    )}
                                    {d.status !== 'OPEN' && (
                                        <span className="text-xs text-gray-500 italic">Resolved</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

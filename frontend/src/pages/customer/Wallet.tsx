/**
 * Customer Wallet Page - View balance and transactions
 */
import React from 'react';

const CustomerWallet: React.FC = () => {
  const transactions = [
    { id: 'TXN001', type: 'credit', amount: '₹500', description: 'Wallet Top-up', date: 'Dec 27, 2024' },
    { id: 'TXN002', type: 'debit', amount: '₹350', description: 'Payment for BK001', date: 'Dec 26, 2024' },
    { id: 'TXN003', type: 'credit', amount: '₹50', description: 'Cashback', date: 'Dec 25, 2024' },
    { id: 'TXN004', type: 'debit', amount: '₹800', description: 'Payment for BK002', date: 'Dec 24, 2024' }
  ];

  const balance = '₹1,200';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#0A2540] italic">My Wallet</h1>
      
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-[#0A2540] to-[#1a3a5c] rounded-[2rem] p-8 text-white">
        <p className="text-sm opacity-70 uppercase tracking-widest">Available Balance</p>
        <p className="text-5xl font-black italic my-4">{balance}</p>
        <button className="px-6 py-3 bg-white text-[#0A2540] rounded-2xl font-bold text-xs uppercase tracking-widest">Add Money</button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-[#0A2540] mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.map(txn => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {txn.type === 'credit' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="font-bold text-[#0A2540]">{txn.description}</p>
                  <p className="text-xs text-slate-400">{txn.date}</p>
                </div>
              </div>
              <span className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {txn.type === 'credit' ? '+' : '-'}{txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerWallet;


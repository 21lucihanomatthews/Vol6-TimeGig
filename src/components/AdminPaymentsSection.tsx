import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPaymentsSection() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase.from('payment_requests').select('*');
      if (data) setPayments(data);
    };
    fetchPayments();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    await supabase.from('payment_requests').update({ status }).eq('id', id);
    setPayments(prev => prev.map(p => p.id === id ? {...p, status} : p));
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200">
      <h3 className="text-sm font-black mb-4">Payment Requests</h3>
      <div className="space-y-4">
        {payments.map(p => (
          <div key={p.id} className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
            <div className='text-xs'>User: {p.user_id} | Coins: {p.coin_package_id} | Amount: {p.amount}</div>
            <div className='flex gap-2'>
              <button onClick={() => handleUpdate(p.id, 'approved')} className='text-[10px] font-bold bg-green-500 text-white px-2 py-1 rounded'>Approve</button>
              <button onClick={() => handleUpdate(p.id, 'rejected')} className='text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded'>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, FileText, ExternalLink, Clock, User, Banknote, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COIN_VALUES: Record<string, number> = {
  '30d-10': 10,
  '30d-20': 20,
  '30d-50': 50,
  '30d-100': 100,
  '30d-150': 150,
  '60d-1500': 1500,
};

export default function AdminPaymentsSection() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    fetchPayments();

    // Enable Supabase Realtime for payment requests
    const channel = supabase
      .channel('payment_requests_live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch profile for the new payment
            const { data: profile } = await supabase
              .from('profile')
              .select('name, surname, avatar')
              .eq('id', payload.new.user_id)
              .maybeSingle();

            const newPayment = { ...payload.new, profile };
            setPayments(prev => [newPayment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPayments(prev => prev.map(p => p.id === payload.new.id ? { ...payload.new, profile: p.profile } : p));
          } else if (payload.eventType === 'DELETE') {
            setPayments(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch raw payments first to ensure we see them even if profiles fail
      const { data, error: fetchError } = await supabase
        .from('payment_requests')
        .select(`
          *,
          profile!user_id (
            name,
            surname,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payments:', fetchError);
        setError(`DB Error: ${fetchError.message}`);
        setDebugInfo(JSON.stringify(fetchError, null, 2));
      } else if (data) {
        setPayments(data);
        const hasProofs = data.filter(p => !!p.proof_of_payment_url).length;
        setDebugInfo(`Successfully fetched ${data.length} payments.
With Proof: ${hasProofs}
Without Proof: ${data.length - hasProofs}
Timestamp: ${new Date().toLocaleTimeString()}
Keys found: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'No records'}`);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching payments:', err);
      setError(`System Error: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = payments
    .filter(p => p.status === 'approved' || p.status === 'processed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleUpdate = async (payment: any, status: string) => {
    try {
      // 1. Update the payment request status
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ status })
        .eq('id', payment.id);
      
      if (updateError) {
        alert("Verification Update Failed: " + updateError.message);
        return;
      }

      // 2. If approved, increment the user's wallet
      if (status === 'approved') {
        const { data: profile, error: fetchError } = await supabase
          .from('profile')
          .select('metrics, coin_balance')
          .eq('id', payment.user_id)
          .maybeSingle();

        if (profile && !fetchError) {
          const coinsToAdd = COIN_VALUES[payment.coin_package_id] || 0;
          const currentBalance = Number(profile.coin_balance || 0);
          const newBalance = currentBalance + coinsToAdd;
          
          const currentMetrics = typeof profile.metrics === 'string' ? JSON.parse(profile.metrics) : profile.metrics;
          const updatedMetrics = {
            ...currentMetrics,
            coinBalance: newBalance
          };

          const { error: walletError } = await supabase
            .from('profile')
            .update({ 
              metrics: updatedMetrics,
              coin_balance: newBalance 
            })
            .eq('id', payment.user_id);

          if (!walletError) {
            console.log(`Approved R${payment.amount}. Added ${coinsToAdd} coins to user ${payment.user_id}. New balance: ${newBalance}`);
            alert(`✅ PAYMENT APPROVED\n\nUser ${payment.profile?.name || payment.user_id} has been credited with ${coinsToAdd} TimeGIG coins automatically.`);
          } else {
            console.error('Wallet update error:', walletError);
            alert("Payment marked as approved, but wallet credit failed. Please manual sync or check logs.");
          }
        } else {
          console.error('Profile fetch failed during approval:', fetchError);
        }
      }

      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status } : p));
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      alert("An unexpected error occurred: " + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Impact Profit Card */}
      <div className="bg-mzansi-green p-8 md:p-10 rounded-[40px] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Banknote size={20} className="text-mzansi-gold" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white/80">Total Live Profit</span>
            </div>
            <div className="flex items-baseline gap-1 justify-center sm:justify-start">
              <span className="text-3xl sm:text-4xl font-bold opacity-60">R</span>
              <h2 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none">
                {totalProfit.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')[0]}
                <span className="text-3xl sm:text-4xl opacity-50 font-bold">.{totalProfit.toFixed(2).split('.')[1]}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="px-4 py-2 bg-black/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mzansi-gold animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Safe Management View</span>
            </div>
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider text-center sm:text-right">Based on {payments.filter(p => p.status === 'approved' || p.status === 'processed').length} verified transactions</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Payment Verification</h3>
            <p className="text-xs text-slate-500 font-medium">Review and process bank transfer top-ups</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {error && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">
                <AlertCircle size={14} />
                <span className="max-w-[150px] truncate">{error}</span>
              </div>
            )}
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              title="Troubleshooting"
            >
              <AlertCircle size={14} />
            </button>
            <button 
              onClick={fetchPayments}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition disabled:opacity-50"
              title="Refresh payments"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="bg-indigo-50 px-3 py-1.5 rounded-xl whitespace-nowrap">
              <span className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {payments.filter(p => p.status === 'pending').length} Pending Requests
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showDebug && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-slate-900 rounded-2xl font-mono text-[10px] text-emerald-400 overflow-auto max-h-48 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">System Debug Logs</span>
                <button onClick={() => setDebugInfo('')} className="text-slate-500 hover:text-white">Clear</button>
              </div>
              <pre>{debugInfo || 'No logs yet...'}</pre>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Banknote size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold">No payment requests found</p>
            </div>
          ) : (
            payments.map(p => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                      p.status === 'approved' ? 'bg-green-50 text-green-600' :
                      p.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {p.status === 'approved' ? <CheckCircle2 size={24} /> :
                       p.status === 'rejected' ? <XCircle size={24} /> :
                       <Clock size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900">R{p.amount || '0'}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {p.coin_package_id || 'Topup'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          {p.profile?.avatar ? (
                            <img src={p.profile.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                              <User size={10} className="text-slate-400" />
                            </div>
                          )}
                          <span>{p.profile?.name} {p.profile?.surname}</span>
                          <span className="text-slate-300 mx-1">|</span>
                          <span>UID: {p.user_id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <Clock size={10} />
                          <span>{new Date(p.created_at || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.proof_of_payment_url && (
                      <button 
                        onClick={() => setSelectedProof(p.proof_of_payment_url)} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <FileText size={14} />
                        View Proof
                        <ExternalLink size={12} />
                      </button>
                    )}
                    
                    {p.status === 'pending' && (
                      <div className="flex gap-2 border-l border-slate-100 pl-3">
                        <button 
                          onClick={() => handleUpdate(p, 'approved')} 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 size={24} />
                        </button>
                        <button 
                          onClick={() => handleUpdate(p, 'rejected')} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Reject"
                        >
                          <XCircle size={24} />
                        </button>
                      </div>
                    )}

                    {p.status !== 'pending' && (
                      <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Proof Preview Modal */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl max-w-4xl w-full max-h-full flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Proof Identification</h4>
                  <p className="text-sm text-slate-500 font-medium">Original document submission</p>
                </div>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-50/50 flex justify-center items-start">
                <img 
                  src={selectedProof} 
                  alt="Payment Proof" 
                  className="max-w-full h-auto rounded-3xl shadow-xl border-8 border-white"
                />
              </div>
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

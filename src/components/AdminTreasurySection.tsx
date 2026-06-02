import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Landmark, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminTreasurySection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    bank: '',
    account: '',
    name: ''
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'bank_details')
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (data?.value) {
        setBankDetails(data.value);
      }
    } catch (err: any) {
      console.error('Error fetching bank details:', err);
      setError('Failed to load bank details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const { error: upsertErr } = await supabase
        .from('settings')
        .upsert({
          key: 'bank_details',
          value: bankDetails,
          updated_at: new Date().toISOString()
        });

      if (upsertErr) throw upsertErr;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving bank details:', err);
      setError('Failed to update bank details: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm animate-pulse h-48" />
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Treasury Configuration</h3>
          <p className="text-xs text-slate-500 font-medium">Configure where your South African members send payments</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
          <Landmark size={20} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receiving Bank</label>
            <input 
              type="text" 
              value={bankDetails.bank}
              onChange={(e) => setBankDetails(prev => ({ ...prev, bank: e.target.value }))}
              placeholder="e.g. Capitec, FNB, Standard Bank"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
            <input 
              type="text" 
              value={bankDetails.name}
              onChange={(e) => setBankDetails(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. TimeGIG Services"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number / IBAN</label>
          <input 
            type="text" 
            value={bankDetails.account}
            onChange={(e) => setBankDetails(prev => ({ ...prev, account: e.target.value }))}
            placeholder="Enter full account digits"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            required
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold border border-green-100"
            >
              <CheckCircle2 size={14} />
              Bank details updated successfully! These are now live for all users.
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Secure & Deploy Details'}
        </button>
      </form>
    </div>
  );
}

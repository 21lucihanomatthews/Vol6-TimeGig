import { X, Upload, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const PACKAGES = [
  { id: '30d-10', coins: 10, price: 'R5', amount: 5, expireDays: 30 },
  { id: '30d-20', coins: 20, price: 'R10', amount: 10, expireDays: 30 },
  { id: '30d-50', coins: 50, price: 'R15', amount: 15, expireDays: 30 },
  { id: '30d-100', coins: 100, price: 'R29.99', amount: 29.99, expireDays: 30 },
  { id: '30d-150', coins: 150, price: 'R35.99', amount: 35.99, expireDays: 30 },
  { id: '60d-1500', coins: 1500, price: 'R99.99', amount: 99.99, expireDays: 60 },
];

export default function TopupModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<typeof PACKAGES[0] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;

    // Limit file size to 2MB to prevent large base64 strings failing to insert
    const MAX_SIZE = 2 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      setError('The proof document is too large. Please upload a smaller image or document (max 2MB).');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 0. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Please log in to submit payment proof.');

      // 1. Convert file to base64 (for demo simplicity, real apps use storage buckets)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const proofBase64 = await base64Promise;

      // 2. Insert into Supabase
      const { error: insertError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          amount: selected.amount,
          coin_package_id: selected.id,
          proof_of_payment_url: proofBase64,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setIsSent(true);
      // Automatically close or stay to show success
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Topup Coins</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {isSent ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Payment Sent!</h3>
            <p className="text-slate-500 max-w-xs mx-auto">We've received your proof of payment. Your coins will be added shortly.</p>
          </div>
        ) : !selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PACKAGES.map(pkg => (
              <button 
                key={pkg.id} 
                onClick={() => setSelected(pkg)}
                className="w-full flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-mzansi-gold hover:bg-slate-50 transition-all group"
              >
                <div className="text-left">
                  <p className="font-black text-lg group-hover:text-mzansi-gold transition-colors">{pkg.coins} Coins</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pkg.expireDays} Day Expiry</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-mzansi-green bg-mzansi-green/10 px-3 py-1 rounded-full">{pkg.price}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Transfer {selected.price}</h3>
              <p className="text-sm text-slate-500">Please use the details below</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Bank</span>
                <span className="font-bold text-slate-900">Capitec</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Account</span>
                <span className="font-bold text-slate-900 tracking-wider">1334067366</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Name</span>
                <span className="font-bold text-slate-900">Matthews</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Reference</span>
                <span className="font-black text-mzansi-gold">{selected.coins} Coins</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold mb-2"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload}
                accept="image/*,application/pdf"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 ${
                  isUploading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                }`}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent" />
                ) : (
                  <Upload size={18} strokeWidth={3} />
                )}
                {isUploading ? 'Uploading...' : 'Upload Proof of Payment'}
              </button>
              <button 
                onClick={() => setSelected(null)} 
                className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Back to packages
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

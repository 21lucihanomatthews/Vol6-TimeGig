import { Wallet, PlusCircle } from 'lucide-react';
import { UserProfileData } from '../types';
import { useState } from 'react';
import TopupModal from './TopupModal';

interface WalletDisplayProps {
  profile: UserProfileData;
}

export default function WalletDisplay({ profile }: WalletDisplayProps) {
  const [showTopup, setShowTopup] = useState(false);
  const coinBalance = profile.metrics.coinBalance || 0;

  return (
    <>
    <div className="px-6 py-4 flex items-center justify-between bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-mzansi-gold rounded-full text-white">
          <Wallet size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coin Balance</p>
          <p className="text-sm font-black text-slate-900">{coinBalance} Coins</p>
        </div>
      </div>
      <button 
        onClick={() => setShowTopup(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-mzansi-green text-white rounded-full text-[10px] font-bold uppercase transition hover:bg-opacity-90"
      >
        <PlusCircle size={14}/> Topup
      </button>
    </div>
    {showTopup && <TopupModal onClose={() => setShowTopup(false)} />}
    </>
  );
}

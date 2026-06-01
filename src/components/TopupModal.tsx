import { X, Upload } from 'lucide-react';
import { useState } from 'react';

const PACKAGES = [
  { id: '30d-10', coins: 10, price: 'R5', expireDays: 30 },
  { id: '30d-20', coins: 20, price: 'R10', expireDays: 30 },
  { id: '30d-50', coins: 50, price: 'R15', expireDays: 30 },
  { id: '30d-100', coins: 100, price: 'R29.99', expireDays: 30 },
  { id: '30d-150', coins: 150, price: 'R35.99', expireDays: 30 },
  { id: '60d-1500', coins: 1500, price: 'R99.99', expireDays: 60 },
];

export default function TopupModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<typeof PACKAGES[0] | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900">Topup Coins</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {!selected ? (
          <div className="space-y-4">
            {PACKAGES.map(pkg => (
              <button 
                key={pkg.id} 
                onClick={() => setSelected(pkg)}
                className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-mzansi-gold transition"
              >
                <div>
                  <p className="font-bold">{pkg.coins} Coins</p>
                  <p className="text-xs text-slate-500">Expires in {pkg.expireDays} days</p>
                </div>
                <p className="font-black text-mzansi-green">{pkg.price}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-center">Pay via Bank Transfer</h3>
            <div className="bg-slate-100 p-4 rounded-xl text-xs space-y-1">
              <p>Bank: <span className='font-bold'>Capitec</span></p>
              <p>Account: <span className='font-bold'>1334067366</span></p>
              <p>Name: <span className='font-bold'>Matthews</span></p>
              <p>Ref: <span className='font-bold'>{selected.coins} Coins</span></p>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold">
              <Upload size={16} /> Upload Proof of Payment
            </button>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 underline w-full text-center">Back to packages</button>
          </div>
        )}
      </div>
    </div>
  );
}

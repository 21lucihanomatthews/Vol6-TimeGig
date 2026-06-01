import { motion } from 'motion/react';
import { User, Briefcase, Search, Shield } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomMenuProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function BottomMenu({ activeTab, setActiveTab }: BottomMenuProps) {
  const menuItems = [
    { id: 'gigs', label: 'Gigs', icon: Briefcase },
    { id: 'seekers', label: 'Seekers', icon: Search },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin', label: 'Admin', icon: Shield },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-1.5 md:py-2 flex items-center justify-center shadow-[0_-4px_20px_-4px_rgba(148,163,184,0.08)]">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full max-w-sm">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`tab-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="relative flex-1 h-10 md:h-12 flex flex-col items-center justify-center gap-0.5 transition-all rounded-lg cursor-pointer select-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-mzansi-green rounded-lg shadow-md shadow-mzansi-green/20 border border-mzansi-gold/30"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <span className={`relative z-10 transition-transform duration-250 ${isActive ? 'scale-105 text-white' : 'text-slate-600 group-hover:text-mzansi-green'}`}>
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>

              <span className={`relative z-10 text-[8px] md:text-[9.5px] font-black uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-mzansi-green'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

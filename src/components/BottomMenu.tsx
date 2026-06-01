import { motion } from 'motion/react';
import { User, Briefcase, Search, Shield, MessageSquare } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomMenuProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: any;
}

export default function BottomMenu({ activeTab, setActiveTab, user }: BottomMenuProps) {
  const menuItems = [
    { id: 'gigs', label: 'Gigs', icon: Briefcase },
    { id: 'seekers', label: 'Seekers', icon: Search },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.email === '21lucihanomatthews@gmail.com' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ] as const;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 p-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`tab-btn-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className="relative flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
            >
              <div className={`
                flex items-center justify-center p-3 rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg -translate-y-1' 
                  : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'
                }
              `}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="bubble-label"
                  className="absolute -bottom-6 flex flex-col items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-indigo-100 whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

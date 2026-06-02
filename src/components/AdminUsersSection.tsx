import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Circle, ShieldCheck, Mail, Wallet, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminUsersSection({ onlineUsers }: { onlineUsers: Set<string> }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();

    // Setup Realtime listener for Profile changes (new users, balance updates)
    const profileChannel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUsers(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
          } else if (payload.eventType === 'DELETE') {
            setUsers(prev => prev.filter(u => u.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profile')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Community Registry</h3>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor all registered TimeGIG members</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
          <Circle size={10} className="fill-green-500 text-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600">{onlineUsers.size} Active Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-[32px] border border-slate-100 animate-pulse" />
          ))
        ) : (
          users.map((u) => {
            const isOnline = onlineUsers.has(u.id);
            return (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Online Status Indicator */}
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-2xl transition-opacity duration-500 ${isOnline ? 'bg-green-400/20 opacity-100' : 'bg-slate-200/20 opacity-0'}`} />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="relative">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <User size={24} className="text-slate-300" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 truncate">{u.name} {u.surname}</h4>
                      {u.email === '21lucihanomatthews@gmail.com' && (
                        <ShieldCheck size={14} className="text-indigo-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium truncate mb-2">
                      <Mail size={10} />
                      <span className="truncate">{u.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-mzansi-gold/10 text-mzansi-gold rounded-lg text-[10px] font-bold">
                        <Wallet size={10} />
                        <span>{u.coin_balance || 0} Coins</span>
                      </div>
                      {isOnline && (
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                          <Clock size={10} />
                          <span>Active Now</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Detail Rail */}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <span className="text-[10px] text-slate-400 font-mono">UID: {u.id.slice(0, 8)}...</span>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Profile</button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

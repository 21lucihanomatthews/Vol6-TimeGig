import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Circle, ShieldCheck, Mail, Wallet, Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminUsersSection({ onlineUsers }: { onlineUsers: Set<string> }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching users:', error);
      } else if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.name} ${u.surname}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || u.email.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Community Registry</h3>
          <p className="text-xs text-slate-500 font-medium">Manage and monitor all registered TimeGIG members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-xs font-bold w-48 sm:w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl w-fit shrink-0">
            <Circle size={10} className="fill-green-500 text-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600">{onlineUsers.size} Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-[28px] border border-slate-100 animate-pulse" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <User size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">No members found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isOnline = onlineUsers.has(u.id);
            return (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Online Status Indicator */}
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full blur-2xl transition-opacity duration-500 ${isOnline ? 'bg-green-400/20 opacity-100' : 'bg-slate-200/20 opacity-0'}`} />
                
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="relative shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <User size={20} className="text-slate-300" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 truncate text-sm">{u.name} {u.surname}</h4>
                      {u.email === '21lucihanomatthews@gmail.com' && (
                        <ShieldCheck size={12} className="text-indigo-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[9px] font-medium truncate mb-2">
                      <Mail size={9} />
                      <span className="truncate">{u.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-mzansi-gold/10 text-mzansi-gold rounded-md text-[9px] font-black">
                        <Wallet size={9} />
                        <span>{u.coin_balance || 0} Coins</span>
                      </div>
                      {isOnline && (
                        <div className="flex items-center gap-1 text-green-600 text-[9px] font-black">
                          <Clock size={9} />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Detail Rail */}
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <span className="text-[9px] text-slate-400 font-mono">UID: {u.id.slice(0, 8)}...</span>
                  <button className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-tight">View Profile</button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminUsersSection() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profile').select('*');
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200">
      <h3 className="text-sm font-black mb-4">Registered Users</h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="text-xs p-2 bg-slate-50 rounded italic">{u.name} - {u.email}</div>
        ))}
      </div>
    </div>
  );
}

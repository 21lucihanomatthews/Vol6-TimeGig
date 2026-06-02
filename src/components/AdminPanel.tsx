import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, UploadCloud, Trash2, Image, Key, Check, Info, FileImage, Sparkles, RefreshCw, Database, AlertTriangle, Server, Code, Copy, ExternalLink, HardDrive, CheckCircle2, Wifi } from 'lucide-react';
import { DbTableStatus, SQL_SCHEMA } from '../lib/supabase';
import AdminUsersSection from './AdminUsersSection';
import AdminPaymentsSection from './AdminPaymentsSection';
import AdminTreasurySection from './AdminTreasurySection';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  onWallpaperChange: (newWallpaper: string | null) => void;
  currentWallpaper: string | null;
  dbStatus: DbTableStatus | null;
  isCheckingDb: boolean;
  recheckDb: () => void;
  syncLocalToSupabase: () => Promise<void>;
  isSyncing: boolean;
  onlineUsers: Set<string>;
}

export default function AdminPanel({ 
  onWallpaperChange, 
  currentWallpaper,
  dbStatus,
  isCheckingDb,
  recheckDb,
  syncLocalToSupabase,
  isSyncing,
  onlineUsers
}: AdminPanelProps) {

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('timegig_admin_session') === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const copySchema = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };
  
  // ... rest of the original AdminPanel code (truncated for edit)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.toLowerCase() === 'admin' || adminPin === '1234') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('timegig_admin_session', 'true');
      setAuthError('');
      setAdminPin('');
    } else {
      setAuthError('❌ Invalid Admin Code. Try "admin" or "1234".');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('timegig_admin_session');
  };

  // Simplified version added below
  if (!isAdminLoggedIn) {
     // ... login screen
     return (<div id="admin-login-screen" className="w-full max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10" />
          <div className="flex flex-col items-center text-center space-y-4">
             <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-200">
               <Shield size={24} />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">TimeGIG Admin Portal</h2>
               <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Access Restricted to South African Managers</p>
             </div>
          </div>
          <form onSubmit={handleAdminLogin} className="mt-8 space-y-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                 <span>Admin PIN or Secret Code</span>
               </label>
               <input type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} placeholder="Enter administrator passcode..." className="w-full py-3 pl-4 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold tracking-widest focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all" required/>
            </div>
            {authError && (<p className="text-[10px] text-red-600 font-bold text-center bg-red-50 py-2.5 px-3 rounded-xl border border-red-100">{authError}</p>)}
            <button type="submit" className="w-full h-11 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md shadow-indigo-600/10 cursor-pointer">Verify & Authenticate</button>
          </form>
        </div>
      </div>);
  }

  return (
    <div id="admin-panel-container" className="w-full max-w-2xl mx-auto px-4 pb-32 pt-6 space-y-6">
      {dbStatus?.error && (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 text-xs font-bold flex items-center gap-3">
          <Wifi size={16} className="text-red-500 animate-pulse" />
          <span>{dbStatus.error}</span>
          <button onClick={recheckDb} className="ml-auto underline decoration-red-300">Retry Connection</button>
        </div>
      )}

      {(!dbStatus?.profileExists || !dbStatus?.paymentRequestsExists) && !dbStatus?.error && (
        <div className="bg-amber-50 p-7 rounded-[40px] border border-amber-200/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-bl-full -z-10" />
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-amber-200/40 rounded-3xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-amber-800" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black uppercase tracking-tight text-amber-900 line-clamp-1">Infrastructure Setup Required</h3>
              <p className="text-xs font-medium leading-relaxed text-amber-800/80">
                To enable the community registry and payment verification system, you must establish the PostgreSQL schema in Supabase.
              </p>
              <div className="flex items-center gap-3 pt-2">
                 <button 
                   onClick={copySchema}
                   className="flex items-center gap-2 px-5 py-2.5 bg-amber-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-amber-950 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
                 >
                   {showCopySuccess ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                   {showCopySuccess ? 'Copied to Clipboard' : 'Copy SQL Schema'}
                 </button>
                 <button 
                   onClick={() => recheckDb()}
                   className="px-5 py-2.5 bg-white border border-amber-200 text-amber-900 rounded-2xl text-[11px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all active:scale-95"
                 >
                   Recheck
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AdminUsersSection onlineUsers={onlineUsers} />
      <AdminTreasurySection />
      <AdminPaymentsSection />

      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/15 to-transparent blur-2xl rounded-full -z-10" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-md shadow-indigo-500/20 border border-indigo-400">
              SA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">System Admin</h2>
                <span className="text-[9px] font-black bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full uppercase border border-indigo-500/20">
                  Administrator Status
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">admin@timegig.co.za</p>
            </div>
          </div>

          <button
            id="admin-logout-btn"
            onClick={handleAdminLogout}
            className="px-3.5 py-2 border border-slate-800 rounded-xl text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-white transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Real-Time Supabase Backend Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="text-emerald-650 text-emerald-600 animate-pulse" size={18} />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Active Supabase Backend Status</h3>
            </div>
            <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase border border-emerald-200">
              PROD BACKEND ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
            Connects directly to your PostgreSQL Supabase Instance. Tables are verified automatically.
          </p>
        </div>

        {/* Database Verification Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">POSTGRESQL TABLE INTEGRATION CHECKLIST</span>
            <button
              type="button"
              onClick={recheckDb}
              disabled={isCheckingDb}
              className="flex items-center gap-1 text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase cursor-pointer disabled:opacity-50 select-none"
            >
              <RefreshCw size={10} className={isCheckingDb ? 'animate-spin' : ''} />
              <span>{isCheckingDb ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { name: 'profile', status: dbStatus?.profileExists, label: 'Profile Registry' },
              { name: 'gigs', status: dbStatus?.gigsExists, label: 'Gigs Inventory' },
              { name: 'seekers', status: dbStatus?.seekersExists, label: 'Seeker profiles' },
              { name: 'applied_gigs', status: dbStatus?.appliedGigsExists, label: 'Applied Gigs index' },
              { name: 'payment_requests', status: dbStatus?.paymentRequestsExists, label: 'Payments Queue' },
              { name: 'chat_messages', status: dbStatus?.chatMessagesExists, label: 'Chat Infrastructure' },
            ].map((tbl) => (
              <div 
                key={tbl.name}
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  tbl.status 
                    ? 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                    : 'bg-amber-50/40 border-amber-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl ${tbl.status ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {tbl.status ? <Check size={12} /> : <AlertTriangle size={12} />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black tracking-tight">{tbl.label}</p>
                    <p className="text-[9px] font-mono font-bold text-slate-400 leading-none mt-0.5">table: {tbl.name}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border select-none ${
                  tbl.status
                    ? 'bg-emerald-150 text-emerald-800 border-emerald-250'
                    : 'bg-amber-150 text-amber-800 border-amber-250 animate-pulse'
                }`}>
                  {tbl.status ? 'OK' : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallpaper Customization Control Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Image className="text-indigo-650 text-indigo-500" size={18} />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Main Screen Wallpaper Manager</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

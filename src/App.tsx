import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, UserProfileData, GigItem, SeekerItem } from './types';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import GigsList from './components/GigsList';
import SeekersList from './components/SeekersList';
import BottomMenu from './components/BottomMenu';
import AdminPanel from './components/AdminPanel';
import ChatComponent from './components/ChatComponent';
import WalletDisplay from './components/WalletDisplay';
import { Sparkles, Clock, Zap, Hourglass, Database, Wifi } from 'lucide-react';
import { 
  supabase,
  getDbStatus, 
  fetchProfileFromSupabase, 
  saveProfileToSupabase, 
  fetchGigsFromSupabase, 
  saveGigToSupabase, 
  fetchSeekersFromSupabase, 
  saveSeekerToSupabase, 
  fetchAppliedGigsFromSupabase, 
  applyToGigInSupabase, 
  DbTableStatus 
} from './lib/supabase';

const emptyProfile: UserProfileData = {
  name: "New User",
  surname: "",
  avatar: "",
  title: "Full-Stack Developer",
  hourlyRate: 0,
  bio: "",
  skills: [],
  email: "",
  website: "",
  github: "",
  metrics: {
    gigsCompleted: 0,
    rating: 0,
    hourlyRateHistory: [],
  },
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [profile, setProfile] = useState<UserProfileData>(emptyProfile);
  const [gigs, setGigs] = useState<GigItem[]>([]);
  const [seekers, setSeekers] = useState<SeekerItem[]>([]);
  const [appliedGigs, setAppliedGigs] = useState<string[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(2);
  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('timegig_background_wallpaper') || null;
  });

  // Supabase states
  const [dbStatus, setDbStatus] = useState<DbTableStatus | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Presence Tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online_users_channel');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set<string>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) onlineIds.add(p.user_id);
          });
        });
        
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Check database table presence & run initial loading
  const loadDatabaseState = async (silently = false) => {
    if (!user) return;
    if (!silently) setIsCheckingDb(true);
    try {
      const status = await getDbStatus();
      setDbStatus(status);

      // 1. Sync Profile
      if (status.profileExists) {
        const dbProfile = await fetchProfileFromSupabase(user.id);
        if (dbProfile) {
          setProfile(dbProfile);
          localStorage.setItem('timegig_local_profile', JSON.stringify(dbProfile));
        } else {
          // If profile table exists but is empty, try local storage fallback or initial info
          const localStr = localStorage.getItem('timegig_local_profile');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            setProfile(parsed);
            await saveProfileToSupabase(user.id, parsed);
          } else {
            // Seed blank profile instantly in Supabase
            await saveProfileToSupabase(user.id, emptyProfile);
          }
        }
      } else {
        const localStr = localStorage.getItem('timegig_local_profile');
        if (localStr) setProfile(JSON.parse(localStr));
      }

      // 2. Sync Gigs
      if (status.gigsExists) {
        const dbGigs = await fetchGigsFromSupabase();
        if (dbGigs) {
          setGigs(dbGigs);
          localStorage.setItem('timegig_local_gigs', JSON.stringify(dbGigs));
        } else {
          const localStr = localStorage.getItem('timegig_local_gigs');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            setGigs(parsed);
            for (const g of parsed) await saveGigToSupabase(g);
          }
        }
      } else {
        const localStr = localStorage.getItem('timegig_local_gigs');
        if (localStr) setGigs(JSON.parse(localStr));
      }

      // 3. Sync Seekers
      if (status.seekersExists) {
        const dbSeekers = await fetchSeekersFromSupabase();
        if (dbSeekers) {
          setSeekers(dbSeekers);
          localStorage.setItem('timegig_local_seekers', JSON.stringify(dbSeekers));
        } else {
          const localStr = localStorage.getItem('timegig_local_seekers');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            setSeekers(parsed);
            for (const s of parsed) await saveSeekerToSupabase(s);
          }
        }
      } else {
        const localStr = localStorage.getItem('timegig_local_seekers');
        if (localStr) setSeekers(JSON.parse(localStr));
      }

      // 4. Sync Applied Gigs
      if (status.appliedGigsExists) {
        const dbApplied = await fetchAppliedGigsFromSupabase();
        if (dbApplied) {
          setAppliedGigs(dbApplied);
          localStorage.setItem('timegig_local_applied', JSON.stringify(dbApplied));
        } else {
          const localStr = localStorage.getItem('timegig_local_applied');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            setAppliedGigs(parsed);
            for (const id of parsed) await applyToGigInSupabase(id);
          }
        }
      } else {
        const localStr = localStorage.getItem('timegig_local_applied');
        if (localStr) setAppliedGigs(JSON.parse(localStr));
      }

    } catch (err) {
      console.error("Failed to load schema details from Supabase:", err);
    } finally {
      if (!silently) setIsCheckingDb(false);
    }
  };

  // Run on mount
  useEffect(() => {
    if (user) {
      loadDatabaseState();
    }
  }, [user]);

  // Countdown timer for 2 seconds
  useEffect(() => {
    if (countdown <= 0) {
      setShowSplash(false);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Sync / Seed Local Data to Supabase (from Admin UI)
  const handleSyncLocalToSupabase = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const status = await getDbStatus();
      if (!status.profileExists && !status.gigsExists && !status.seekersExists && !status.appliedGigsExists) {
        throw new Error("Missing Tables: Please execute the schema setup code in the Supabase SQL Editor first!");
      }

      if (status.profileExists) {
        await saveProfileToSupabase(user.id, profile);
      }
      if (status.gigsExists) {
        for (const gig of gigs) {
          await saveGigToSupabase(gig);
        }
      }
      if (status.seekersExists) {
        for (const seeker of seekers) {
          await saveSeekerToSupabase(seeker);
        }
      }
      if (status.appliedGigsExists) {
        for (const gigId of appliedGigs) {
          await applyToGigInSupabase(gigId);
        }
      }

      // Refresh states
      await loadDatabaseState(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // State update wrapper handlers (propagates to Supabase + saves to localStorage)
  const handleSetProfile = async (newProfile: UserProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('timegig_local_profile', JSON.stringify(newProfile));
    if (dbStatus?.profileExists && user) {
      await saveProfileToSupabase(user.id, newProfile);
    }
  };

  const handleSetGigs = async (newGigsList: GigItem[] | ((prev: GigItem[]) => GigItem[])) => {
    let finalGigs: GigItem[];
    if (typeof newGigsList === 'function') {
      finalGigs = newGigsList(gigs);
    } else {
      finalGigs = newGigsList;
    }
    setGigs(finalGigs);
    localStorage.setItem('timegig_local_gigs', JSON.stringify(finalGigs));
    
    if (dbStatus?.gigsExists) {
      const existingIds = new Set(gigs.map(g => g.id));
      const newItems = finalGigs.filter(g => !existingIds.has(g.id));
      for (const item of newItems) {
        await saveGigToSupabase(item);
      }
    }
  };

  const handleSetSeekers = async (newSeekersList: SeekerItem[] | ((prev: SeekerItem[]) => SeekerItem[])) => {
    let finalSeekers: SeekerItem[];
    if (typeof newSeekersList === 'function') {
      finalSeekers = newSeekersList(seekers);
    } else {
      finalSeekers = newSeekersList;
    }
    setSeekers(finalSeekers);
    localStorage.setItem('timegig_local_seekers', JSON.stringify(finalSeekers));

    if (dbStatus?.seekersExists) {
      const existingIds = new Set(seekers.map(s => s.id));
      const newItems = finalSeekers.filter(s => !existingIds.has(s.id));
      for (const item of newItems) {
        await saveSeekerToSupabase(item);
      }
    }
  };

  const handleSetAppliedGigs = async (newApplied: string[] | ((prev: string[]) => string[])) => {
    let finalApplied: string[];
    if (typeof newApplied === 'function') {
      finalApplied = newApplied(appliedGigs);
    } else {
      finalApplied = newApplied;
    }
    setAppliedGigs(finalApplied);
    localStorage.setItem('timegig_local_applied', JSON.stringify(finalApplied));

    if (dbStatus?.appliedGigsExists) {
      const existing = new Set(appliedGigs);
      const newlyAdded = finalApplied.filter(id => !existing.has(id));
      for (const gigId of newlyAdded) {
        await applyToGigInSupabase(gigId);
      }
    }
  };

  const handleWallpaperChange = (newWallpaper: string | null) => {
    setWallpaper(newWallpaper);
    if (newWallpaper) {
      localStorage.setItem('timegig_background_wallpaper', newWallpaper);
    } else {
      localStorage.removeItem('timegig_background_wallpaper');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Render Auth component if not logged in
  if (loadingUser) return <div className="min-h-screen bg-[#FCFBF8]"></div>;
  if (!user) return <Auth onAuthSuccess={(u) => setUser(u)} />;



  return (
    <div id="root-container" className={`min-h-screen ${wallpaper ? 'bg-transparent' : 'bg-[#FCFBF8]'} text-slate-900 ${activeTab === 'chat' ? 'pb-0' : 'pb-28'} font-sans relative transition-all duration-500`}>
      {/* Dynamic Admin Wallpaper Layer */}
      {wallpaper && (
        <>
          <div 
            className="fixed inset-0 pointer-events-none transition-all duration-500"
            style={{
              backgroundImage: `url(${wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              zIndex: 1,
            }}
          />
          <div 
            className="fixed inset-0 bg-white/10 backdrop-blur-xl pointer-events-none transition-all duration-500" 
            style={{ zIndex: 2 }}
          />
        </>
      )}

      {/* Main Application Container Layered above Background */}
      <div className="relative" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash-screen"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
              className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white"
            >
              {/* Ambient South African Background Glows */}
              <div className="absolute inset-x-0 top-1/4 h-80 bg-mzansi-green/15 blur-3xl rounded-full" />
              <div className="absolute inset-x-0 bottom-1/4 h-80 bg-mzansi-gold/10 blur-3xl rounded-full" />
  
              <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center justify-center">
                {/* Title */}
                <motion.h1
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="text-5xl font-black tracking-wider text-white uppercase text-center"
                >
                  TimeGIG
                </motion.h1>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* South African Color Ribbon at top */}
              {activeTab !== 'chat' && (
                <div className="h-1.5 w-full bg-gradient-to-r from-mzansi-red via-mzansi-green via-mzansi-gold to-mzansi-blue absolute top-0 left-0 right-0" />
              )}
              
              {activeTab !== 'chat' && <WalletDisplay profile={profile} />}
  
              {/* Primary Transition Screen Wrapper */}
              <main className="relative min-h-screen">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <UserProfile
                        profile={profile}
                        setProfile={handleSetProfile}
                        gigs={gigs}
                        setGigs={handleSetGigs}
                        appliedGigs={appliedGigs}
                        seekers={seekers}
                        onLogout={handleLogout}
                      />
                    </motion.div>
                  )}
  
                  {activeTab === 'gigs' && (
                    <motion.div
                      key="gigs"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <GigsList
                        gigs={gigs}
                        setGigs={handleSetGigs}
                        userSkills={profile.skills}
                        appliedGigs={appliedGigs}
                        setAppliedGigs={handleSetAppliedGigs}
                      />
                    </motion.div>
                  )}
  
                  {activeTab === 'seekers' && (
                    <motion.div
                      key="seekers"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <SeekersList
                        seekers={seekers}
                        setSeekers={handleSetSeekers}
                        userSkills={profile.skills}
                        profile={profile}
                      />
                    </motion.div>
                  )}
  
                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <ChatComponent />
                    </motion.div>
                  )}
  
                  {activeTab === 'admin' && user?.email === '21lucihanomatthews@gmail.com' && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <AdminPanel
                        onWallpaperChange={handleWallpaperChange}
                        currentWallpaper={wallpaper}
                        dbStatus={dbStatus}
                        isCheckingDb={isCheckingDb}
                        recheckDb={() => loadDatabaseState(false)}
                        syncLocalToSupabase={handleSyncLocalToSupabase}
                        isSyncing={isSyncing}
                        onlineUsers={onlineUsers}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
  
              {/* Floating Bottom Menu */}
              <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

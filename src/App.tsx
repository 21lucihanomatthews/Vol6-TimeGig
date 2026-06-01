import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialProfile, initialGigs, initialSeekers } from './data/mockData';
import { ActiveTab, UserProfileData, GigItem, SeekerItem } from './types';
import UserProfile from './components/UserProfile';
import GigsList from './components/GigsList';
import SeekersList from './components/SeekersList';
import BottomMenu from './components/BottomMenu';
import AdminPanel from './components/AdminPanel';
import { Sparkles, Clock, Zap, Hourglass, Database, Wifi } from 'lucide-react';
import { 
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);
  const [gigs, setGigs] = useState<GigItem[]>(initialGigs);
  const [seekers, setSeekers] = useState<SeekerItem[]>(initialSeekers);
  const [appliedGigs, setAppliedGigs] = useState<string[]>(['gig-2']);
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(2);
  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('timegig_background_wallpaper') || null;
  });

  // Supabase states
  const [dbStatus, setDbStatus] = useState<DbTableStatus | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check database table presence & run initial loading
  const loadDatabaseState = async (silently = false) => {
    if (!silently) setIsCheckingDb(true);
    try {
      const status = await getDbStatus();
      setDbStatus(status);

      // 1. Sync Profile
      if (status.profileExists) {
        const dbProfile = await fetchProfileFromSupabase();
        if (dbProfile) {
          setProfile(dbProfile);
          localStorage.setItem('timegig_local_profile', JSON.stringify(dbProfile));
        } else {
          // If profile table exists but is empty, try local storage fallback or initial info
          const localStr = localStorage.getItem('timegig_local_profile');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            setProfile(parsed);
            await saveProfileToSupabase(parsed);
          } else {
            // Seed profile instantly in Supabase
            await saveProfileToSupabase(initialProfile);
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
    loadDatabaseState();
  }, []);

  // Sync / Seed Local Data to Supabase (from Admin UI)
  const handleSyncLocalToSupabase = async () => {
    setIsSyncing(true);
    try {
      const status = await getDbStatus();
      if (!status.profileExists && !status.gigsExists && !status.seekersExists && !status.appliedGigsExists) {
        throw new Error("Missing Tables: Please execute the schema setup code in the Supabase SQL Editor first!");
      }

      if (status.profileExists) {
        await saveProfileToSupabase(profile);
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
    if (dbStatus?.profileExists) {
      await saveProfileToSupabase(newProfile);
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


  return (
    <div id="root-container" className={`min-h-screen ${wallpaper ? 'bg-transparent' : 'bg-[#FCFBF8]'} text-slate-900 pb-28 font-sans relative transition-all duration-500`}>
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
            className="fixed inset-0 bg-[#FCFBF8]/65 backdrop-blur-[2px] pointer-events-none transition-all duration-500" 
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
              <div className="h-1.5 w-full bg-gradient-to-r from-mzansi-red via-mzansi-green via-mzansi-gold to-mzansi-blue absolute top-0 left-0 right-0" />
  
              {/* Primary Transition Screen Wrapper */}
              <main className="relative min-h-[calc(100vh-140px)]">
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
  
                  {activeTab === 'admin' && (
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
                      />

                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
  
              {/* Floating Bottom Menu */}
              <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

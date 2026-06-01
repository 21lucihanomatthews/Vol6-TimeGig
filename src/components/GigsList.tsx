import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GigItem } from '../types';
import { Search, MapPin, DollarSign, Calendar, Clock, Plus, X, Tag } from 'lucide-react';

const QUICK_TEMPLATES = [
  {
    id: 'gardening',
    emoji: '🌿',
    name: 'Gardening Help',
    title: 'Backyard Rose Weeding & Mowing',
    company: 'Homeowner Jane',
    description: 'Need help tidying up my back lawn. Standard mowing, pulling weeds, and collecting clippings. Garden tools are provided in the garage.',
    budget: 350,
    paymentType: 'Fixed' as const,
    duration: '4 hours',
    tags: 'Gardening, Helper, Outdoors',
    location: 'Rondebosch, Cape Town',
    difficulty: 'Entry' as const,
    picture: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cleaning',
    emoji: '🧹',
    name: 'House Cleaning',
    title: 'Spring Cleaning & Laundry Help',
    company: 'Alex Smith',
    description: 'Need an extra pair of hands to clean windows, mop the kitchen flooring, and fold laundry. I have all detergents and cloths in the cupboard.',
    budget: 250,
    paymentType: 'Fixed' as const,
    duration: '1 afternoon',
    tags: 'Cleaning, Laundry, Helper',
    location: 'Sandton, Randburg',
    difficulty: 'Entry' as const,
    picture: 'https://images.unsplash.com/photo-1563315629-c886ae0875da?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'dogwalking',
    emoji: '🐶',
    name: 'Dog Walker',
    title: 'Daily Dog Walking (Golden Retriever)',
    company: 'Peter S.',
    description: 'Walk a highly active, friendly Golden Retriever around the nearby forest park. Must be reliable and gentle with large dogs.',
    budget: 120,
    paymentType: 'Hourly' as const,
    duration: '2 hours',
    tags: 'Pets, DogWalking, Outdoors',
    location: 'Sea Point, Cape Town',
    difficulty: 'Entry' as const,
    picture: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tech',
    emoji: '💻',
    name: 'Tech Setup',
    title: 'Connect Wi-Fi Router & Smart TV',
    company: 'Mary Johnson',
    description: 'I just moved in and need someone to set up my Wi-Fi router, explain the password settings, and make sure Netflix is connected on my Smart TV.',
    budget: 350,
    paymentType: 'Fixed' as const,
    duration: '1-2 hours',
    tags: 'Tech, Setup, Wifi',
    location: 'Pretoria East',
    difficulty: 'Intermediate' as const,
    picture: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'lifting',
    emoji: '📦',
    name: 'Lifting & Moving',
    title: 'Unloading Furniture Boxes from Truck',
    company: 'David K.',
    description: 'Need sturdy person to help unload flat-pack furniture boxes from a delivery truck and carry them up one flight of stairs to my flat.',
    budget: 180,
    paymentType: 'Hourly' as const,
    duration: '3 hours',
    tags: 'HeavyLifting, Moving',
    location: 'Umhlanga, Durban',
    difficulty: 'Entry' as const,
    picture: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400'
  }
];

interface GigsListProps {
  gigs: GigItem[];
  setGigs: (gigs: GigItem[]) => void;
  userSkills: string[];
  appliedGigs: string[];
  setAppliedGigs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function GigsList({ gigs, setGigs, userSkills, appliedGigs, setAppliedGigs }: GigsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedGig, setSelectedGig] = useState<GigItem | null>(null);
  const [showAddGigForm, setShowAddGigForm] = useState(false);

  // Form states for posting a new gig
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState(100);
  const [newPaymentType, setNewPaymentType] = useState<'Fixed' | 'Hourly'>('Fixed');
  const [newDuration, setNewDuration] = useState('2 weeks');
  const [newTagsStr, setNewTagsStr] = useState('');
  const [newLocation, setNewLocation] = useState('Remote (Earth)');
  const [newDifficulty, setNewDifficulty] = useState<'Entry' | 'Intermediate' | 'Expert'>('Intermediate');
  const [newPictureTheme, setNewPictureTheme] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300');
  const [newCustomPictures, setNewCustomPictures] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Filter & search logic
  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = selectedDifficulty === 'All' || gig.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const handlePostGig = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = newTagsStr
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newGig: GigItem = {
      id: `gig-${Date.now()}`,
      title: newTitle,
      company: newCompany,
      description: newDescription,
      budget: Number(newBudget),
      paymentType: newPaymentType,
      duration: newDuration,
      tags: tags.length > 0 ? tags : ['Creative'],
      location: newLocation,
      difficulty: newDifficulty,
      createdAt: 'Just now',
      picture: newCustomPictures.length > 0 ? newCustomPictures[0] : newPictureTheme,
      pictures: newCustomPictures.length > 0 ? newCustomPictures : [newPictureTheme]
    };

    setGigs([newGig, ...gigs]);

    // Reset form & close
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setNewBudget(100);
    setNewPaymentType('Fixed');
    setNewDuration('2 weeks');
    setNewTagsStr('');
    setNewLocation('Remote (Earth)');
    setNewDifficulty('Intermediate');
    setNewPictureTheme('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300');
    setNewCustomPictures([]);
    setShowAddGigForm(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-6">
      <div className="space-y-6">
        {/* Header and Add Trigger */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Gigs</h2>
            <p className="text-[10px] text-mzansi-green font-extrabold uppercase tracking-wider">💼 Gigs & Small Jobs</p>
          </div>

          <button
            id="post-gig-trigger"
            onClick={() => setShowAddGigForm(true)}
            className="flex items-center gap-1 px-3.5 py-2 bg-mzansi-green hover:bg-mzansi-green/90 text-white font-black rounded-lg text-[10px] cursor-pointer shadow-md shadow-mzansi-green/10 hover:shadow-lg transition-all uppercase tracking-wider"
          >
            <Plus size={14} />
            Post Simple Job
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
          <div className="space-y-1">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">🔍 Search Anything:</p>
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 pointer-events-none" size={13} />
              <input
                type="text"
                placeholder="Type here to search (e.g., 'React', 'Figma', or company)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 placeholder-slate-450 rounded-lg border border-slate-150 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5 font-sans">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">🎯 Choose Casual Gig Type:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { lvl: 'All', label: 'All Casual Gigs' },
                { lvl: 'Entry', label: 'Beginner Tasks' },
                { lvl: 'Intermediate', label: 'Short Gigs' }
              ].map((item) => (
                <button
                  key={item.lvl}
                  onClick={() => setSelectedDifficulty(item.lvl)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer border ${
                    selectedDifficulty === item.lvl
                      ? 'bg-mzansi-green text-white border-mzansi-green shadow-sm shadow-mzansi-green/10'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Helpful description under filter */}
            <p className="text-[9px] text-mzansi-green font-bold bg-emerald-50/40 px-2.5 py-1 rounded-lg border border-emerald-100/30">
              {selectedDifficulty === 'All' && '💡 Showing all casual gigs. Tap any option above to filter by skill level!'}
              {selectedDifficulty === 'Entry' && '💡 Showing beginner-friendly tasks: Quick, simple jobs that are easily completed.'}
              {selectedDifficulty === 'Intermediate' && '💡 Showing experienced casual gigs: Taming minor problems with basic competence.'}
            </p>
          </div>
        </div>

        {/* Gigs List */}
        <div className="space-y-3.5 animate-fade-in">
          <AnimatePresence mode="popLayout">
            {filteredGigs.map((gig) => {
              // Calculate matching skills with active user
              const matchingUserSkills = gig.tags.filter(tag =>
                userSkills.some(skill => skill.toLowerCase() === tag.toLowerCase())
              );
              const matchesCount = matchingUserSkills.length;
              const hasApplied = appliedGigs.includes(gig.id);

               return (
                <motion.div
                  key={gig.id}
                  layoutId={`gig-card-${gig.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => { setSelectedGig(gig); setActiveImageIndex(0); }}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-mzansi-green hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between gap-3 group relative"
                >
                  <div className="flex-1 flex gap-3 items-start text-left">
                    <img
                      src={gig.picture || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=150"}
                      alt={gig.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-150 shadow-sm transition-transform group-hover:scale-105 duration-200"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wide bg-slate-100 px-2.0 py-0.5 rounded-md border border-slate-200">
                            🏢 {gig.company}
                          </span>
                          <span className={`text-[8.5px] font-black tracking-wide uppercase px-2.0 py-0.5 rounded-md border ${
                            gig.difficulty === 'Expert' ? 'bg-red-50 text-red-600 border-red-100' :
                            gig.difficulty === 'Intermediate' ? 'bg-mzansi-blue/10 text-mzansi-blue border-mzansi-blue/20' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            Level: {gig.difficulty}
                          </span>

                          {matchesCount > 0 && (
                            <span className="text-[8.5px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2.0 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse-subtle">
                              ✨ Match ({matchesCount})
                            </span>
                          )}

                          {hasApplied && (
                            <span className="text-[8.5px] font-black bg-indigo-55 bg-indigo-600 text-white px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              ✓ Applied
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-black text-slate-900 group-hover:text-mzansi-green transition-colors leading-snug pt-0.5">
                          {gig.title}
                        </h3>
                      </div>

                      <p className="text-slate-600 text-2xs leading-relaxed max-w-xl line-clamp-2">
                        {gig.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {gig.tags.map((t, idx) => {
                          const isMatch = userSkills.some(us => us.toLowerCase() === t.toLowerCase());
                          return (
                            <span
                              key={idx}
                              className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 border ${
                                isMatch
                                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-extrabold'
                                  : 'bg-slate-50 border-slate-100 text-slate-500 font-semibold'
                              }`}
                            >
                              <Tag size={8} className={isMatch ? 'text-emerald-600' : 'text-slate-400'} />
                              {t} {isMatch && '✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pricing/Timeline Block */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-stretch md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-3.5 md:min-w-36 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest">
                        💰 {gig.paymentType === 'Hourly' ? 'HOURLY SCALE' : 'FIXED PROJECT PAY'}
                      </p>
                      <p className="text-base font-black text-slate-900 tracking-tight leading-none pt-0.5">
                        R {gig.budget}
                        {gig.paymentType === 'Hourly' && <span className="text-[10px] font-semibold text-slate-400">/hr</span>}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-1.5 text-right">
                      <div className="flex items-center gap-0.5 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                        <Clock size={10} className="text-slate-400" />
                        <span>⏳ {gig.duration}</span>
                      </div>
                    </div>

                    {/* Highly descriptive call to action button */}
                    <div className="pt-1 flex justify-end">
                      {hasApplied ? (
                        <span className="w-full text-center px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-2xs font-bold transition-colors self-end uppercase tracking-wider">
                          ✓ Applied (View)
                        </span>
                      ) : (
                        <span className="w-full text-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-2xs font-bold transition-colors self-end uppercase tracking-wider">
                          👉 View & Apply
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredGigs.length === 0 && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
                <p className="text-sm text-slate-400 font-medium">No active gigs match your search parameters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedDifficulty('All'); }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedGig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGig(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              layoutId={`gig-card-${selectedGig.id}`}
              className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 relative z-10 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedGig(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                {/* Hero picture banner with multiple picture carousel support */}
                <div className="space-y-2">
                  <div className="w-full h-48 rounded-2xl overflow-hidden relative border border-slate-150 shadow-sm bg-slate-100">
                    <img
                      src={
                        selectedGig.pictures && selectedGig.pictures.length > 0
                          ? selectedGig.pictures[activeImageIndex] || selectedGig.picture
                          : selectedGig.picture || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=400"
                      }
                      alt={selectedGig.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-350"
                    />
                    
                    {/* Image indicator badges if multiple */}
                    {(selectedGig.pictures && selectedGig.pictures.length > 1) && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                        {activeImageIndex + 1} / {selectedGig.pictures.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails row */}
                  {selectedGig.pictures && selectedGig.pictures.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 text-left scrollbar-thin">
                      {selectedGig.pictures.map((pic, idx) => {
                        const isCurrent = idx === activeImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-14 h-11 shrink-0 rounded-lg overflow-hidden border transition-all ${
                              isCurrent 
                                ? 'border-mzansi-green ring-2 ring-mzansi-green/35 scale-[1.02]' 
                                : 'border-slate-200 hover:border-slate-300 opacity-85'
                            }`}
                          >
                            <img
                              src={pic}
                              alt={`Thumbnail indicator ${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      🏢 {selectedGig.company}
                    </span>
                    <span className="text-[10px] font-black text-mzansi-blue bg-mzansi-blue/10 border border-mzansi-blue/20 px-2.5 py-0.5 rounded-md uppercase">
                      Level: {selectedGig.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                    {selectedGig.title}
                  </h3>
                </div>

                <div className="border-t border-b border-emerald-100 bg-emerald-50/20 rounded-3xl py-4 px-2 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">💵 GIG BUDGET</p>
                    <p className="text-sm font-black text-slate-800">R {selectedGig.budget}{selectedGig.paymentType === 'Hourly' ? '/hr' : ''}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">{selectedGig.paymentType} Rate</p>
                  </div>
                  <div className="text-center border-l border-r border-slate-200">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">⏱️ ESTIMATED TIME</p>
                    <p className="text-xs font-black text-slate-800">{selectedGig.duration}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">To Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">📍 WORKPLACE</p>
                    <p className="text-2xs font-extrabold text-mzansi-green truncate" title={selectedGig.location}>
                      {selectedGig.location}
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-medium">Location</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xs font-black text-slate-400 uppercase tracking-widest">📝 Description (What they want you to do):</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                      {selectedGig.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xs font-black text-slate-400 uppercase tracking-widest">🛠️ Skills needed for this job:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGig.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-1.5 rounded-lg font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simulated Beautiful Success Feedback Container inside state to keep it dummy-proof */}
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Close Job Card
                  </button>
                  {appliedGigs.includes(selectedGig.id) ? (
                    <button
                      disabled
                      className="flex-1 py-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-black cursor-not-allowed uppercase tracking-wider"
                    >
                      ✓ Already Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAppliedGigs(prev => [...prev, selectedGig.id]);
                        alert(`🎉 Application Submitted Successfully!\n\nYou've applied to "${selectedGig.title}".\nEmployer corporate profile is notified.`);
                        setSelectedGig(null);
                      }}
                      className="flex-1 py-3 bg-mzansi-green hover:bg-mzansi-green/90 text-white rounded-xl text-xs font-black shadow-md shadow-mzansi-green/20 hover:shadow-lg transition cursor-pointer uppercase tracking-wider"
                    >
                      Submit Easy Application
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Gig Modal */}
      <AnimatePresence>
        {showAddGigForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddGigForm(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 relative z-10 max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Sticky Top Header Section */}
              <div className="p-5 pb-3 border-b border-slate-100 relative bg-white shrink-0">
                <button
                  onClick={() => setShowAddGigForm(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 duration-200 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition"
                >
                  <X size={18} />
                </button>

                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                  <span className="text-sm select-none">✍️</span>
                  <div>
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide">Post a Simple Mzansi Gig</h3>
                    <p className="text-[9.5px] text-emerald-700 font-semibold leading-tight mt-0.5">Fill in this easy form to publish a gig. All details help attract local talent.</p>
                  </div>
                </div>
              </div>

              {/* Form wrapping body and sticky footer */}
              <form onSubmit={handlePostGig} className="flex-1 flex flex-col overflow-hidden">
                {/* Scrollable Form Fields container */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
                  
                  {/* Quick Preset Templates */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 mb-1">
                    <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>⚡ Need inspiration? Tap a Quick Casual Template:</span>
                      <span className="text-[8px] bg-mzansi-green/15 text-mzansi-green px-1.5 py-0.5 rounded-md font-bold uppercase">Auto-fills form</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setNewTitle(tpl.title);
                            setNewCompany(tpl.company);
                            setNewDescription(tpl.description);
                            setNewBudget(tpl.budget);
                            setNewPaymentType(tpl.paymentType);
                            setNewDuration(tpl.duration);
                            setNewTagsStr(tpl.tags);
                            setNewLocation(tpl.location);
                            setNewDifficulty(tpl.difficulty);
                            setNewPictureTheme(tpl.picture);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-mzansi-green hover:bg-emerald-50/25 rounded-lg text-[10px] font-bold text-slate-700 transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <span className="text-xs">{tpl.emoji}</span>
                          <span>{tpl.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">👤 Your Name or Family Name (Who is hiring?)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Rose S. or Homeowner"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">📍 Job Location / Suburb (Where is this simple job?)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sea Point, Cape Town or Pretoria East"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">💼 Quick gig title (What is the task name?)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Garden Rose Weeding / Car Wash / Setup Smart TV"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">📝 Describe the task simply (How can they help you?)</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write a simple summary explaining what you want them to do. E.g. 'I need help cleaning windows and organizing boxes before moving...'"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">💵 Pay Style</label>
                      <select
                        value={newPaymentType}
                        onChange={(e) => setNewPaymentType(e.target.value as 'Fixed' | 'Hourly')}
                        className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
                      >
                        <option value="Fixed">One Flat Pay</option>
                        <option value="Hourly">By the Hour</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">💰 Budget (ZAR R)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newBudget}
                        onChange={(e) => setNewBudget(Number(e.target.value))}
                        className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">⏳ Duration / Hours needed</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 hours, 1 afternoon, Recurring"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">⭐ Experience level required</label>
                      <select
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value as 'Entry' | 'Intermediate')}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
                      >
                        <option value="Entry">Entry (Beginner-friendly casual task)</option>
                        <option value="Intermediate">Intermediate (Skilled casual gig)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">🛠️ Skill Tags (Comma-seperated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Gardening, Cleaning, Lifting, Wi-Fi"
                        value={newTagsStr}
                        onChange={(e) => setNewTagsStr(e.target.value)}
                        className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Custom Multi-Image File Upload Option */}
                  <div className="flex flex-col gap-1.5 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <label className="text-2xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>📸 Place Custom Gig Photos (Upload Multiple!)</span>
                      <span className="text-[10px] text-mzansi-green font-black uppercase">From device</span>
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Attach multiple real photos from your phone or desktop to showcase the work layout! We convert and save them securely inside the application.
                    </p>

                    <div className="flex flex-wrap gap-2 items-center pt-1.5">
                      {/* Add Photo square with a dash outline */}
                      <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-mzansi-green bg-slate-50 hover:bg-emerald-50/20 flex flex-col items-center justify-center cursor-pointer transition duration-150 group">
                        <Plus className="text-slate-400 group-hover:text-mzansi-green group-hover:scale-110 transition duration-150" size={18} />
                        <span className="text-[8px] font-extrabold text-slate-500 group-hover:text-mzansi-green select-none uppercase tracking-wider mt-1">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArray = Array.from(e.target.files);
                              const promises = filesArray.map((file) => {
                                return new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = () => resolve(reader.result as string);
                                  reader.readAsDataURL(file as File);
                                });
                              });
                              Promise.all(promises).then((base64Images) => {
                                setNewCustomPictures((prev) => [...prev, ...base64Images]);
                              });
                            }
                          }}
                        />
                      </label>

                      {/* Thumbnails previewed of already loaded custom images with delete action */}
                      {newCustomPictures.map((pic, index) => (
                        <div key={index} className="w-16 h-16 rounded-xl relative overflow-hidden group border border-slate-200 shadow-2xs">
                          <img
                            src={pic}
                            alt={`Uploaded custom ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewCustomPictures(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold cursor-pointer"
                          >
                            <X size={14} className="hover:scale-110 active:scale-95 duration-100" />
                          </button>
                          <div className="absolute top-1 left-1 bg-black/55 text-[7px] text-white px-1.5 py-0.2 rounded font-black tracking-wider">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sticky Stable Footer Section ALWAYS visible inside the container */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddGigForm(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Discard Gig
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-mzansi-green hover:bg-mzansi-green/90 text-white font-black rounded-xl text-xs cursor-pointer shadow-md shadow-mzansi-green/20 transition-colors uppercase tracking-wider"
                  >
                    Publish Post Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

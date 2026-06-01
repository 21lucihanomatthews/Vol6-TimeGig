import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SeekerItem, UserProfileData } from '../types';
import { Search, Send, UserCheck, Plus, X, Building, DollarSign, Upload, Sparkles } from 'lucide-react';

interface SeekersListProps {
  seekers: SeekerItem[];
  setSeekers: (seekers: SeekerItem[]) => void;
  userSkills: string[];
  profile: UserProfileData;
}

export default function SeekersList({ seekers, setSeekers, userSkills, profile }: SeekersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSeekerForm, setShowAddSeekerForm] = useState(false);

  // Form states for adding a hiring party
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('R300 - R500 / hr');
  const [newSkillsStr, setNewSkillsStr] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [declinedError, setDeclinedError] = useState('');

  React.useEffect(() => {
    if (showAddSeekerForm) {
      if (profile.avatar) {
        setNewAvatar(profile.avatar);
      } else {
        setNewAvatar('');
      }
      
      const fullName = `${profile.name} ${profile.surname || ''}`.trim();
      if (fullName) {
        setNewName(fullName);
      }
      if (profile.title) {
        setNewTitle(profile.title);
      }
    }
  }, [showAddSeekerForm, profile]);

  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateRecruiterFace = async (imageUrl: string) => {
    if (!imageUrl) {
      setNewAvatar('');
      return;
    }
    setIsValidatingFace(true);
    setValidationError('');

    try {
      const res = await fetch('/api/detect-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageUrl })
      });

      if (!res.ok) {
        throw new Error('Verification failed.');
      }

      const data = await res.json();
      if (!data.hasFace) {
        setValidationError(`Face Check Failed: ${data.message || 'No human face detected.'}`);
        setNewAvatar('');
        alert(`⚠️ PROFILE PICTURE REMOVED IMMEDIATELY\n\nOur Face Check AI detected that this photo is not a real human face or portrait profile picture.\n\nReason: ${data.message || 'No face found.'}\n\nPlease choose or upload a real photo.`);
      } else {
        setNewAvatar(imageUrl);
        setValidationError('');
      }
    } catch (err: any) {
      console.error("Error verifying face:", err);
      setNewAvatar(imageUrl);
    } finally {
      setIsValidatingFace(false);
    }
  };

  const filteredSeekers = seekers.filter((seeker) => {
    const matchesSearch =
      seeker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.skillsNeeded.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const handleContact = (seekerId: string) => {
    setSeekers(
      seekers.map(item =>
        item.id === seekerId ? { ...item, contactStatus: 'contacted' as const } : item
      )
    );
  };

  const handlePostSeeker = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidatingFace) {
      alert("⚠️ Verification in progress: Please wait while our Face Check AI validates your portrait picture...");
      return;
    }
    const hasValidAvatar = newAvatar && (newAvatar.startsWith('http') || newAvatar.startsWith('/') || newAvatar.startsWith('data:'));
    if (!hasValidAvatar) {
      setDeclinedError("❌ Registration Declined: TimeGIG SA security rules require uploading or linking a verified face portrait to successfully list a hiring account.");
      return;
    }
    setDeclinedError('');
    const skills = newSkillsStr
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newSeeker: SeekerItem = {
      id: `seeker-${Date.now()}`,
      name: newName,
      company: newCompany,
      avatar: newAvatar,
      title: newTitle,
      description: newDescription,
      budget: newBudget,
      skillsNeeded: skills.length > 0 ? skills : ['React'],
      contactStatus: 'idle'
    };

    setSeekers([newSeeker, ...seekers]);

    // Reset fields
    setNewName('');
    setNewCompany('');
    setNewTitle('');
    setNewDescription('');
    setNewBudget('R300 - R500 / hr');
    setNewSkillsStr('');
    setNewAvatar('');
    setShowAddSeekerForm(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-6">
      <div className="space-y-6">
        {/* Header and Trigger */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Mzansi Recruiters</h2>
            <p className="text-2xs text-mzansi-green font-extrabold uppercase tracking-wider">🇿🇦 MZANSI HIRE MANAGERS</p>
          </div>

          <button
            id="post-seeker-trigger"
            onClick={() => setShowAddSeekerForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-mzansi-green hover:bg-mzansi-green/90 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-mzansi-green/20 hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            Register Recruiter
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search talent acquirers, companies, desired expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-150 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
            />
          </div>
        </div>

        {/* Seeker List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSeekers.map((seeker) => {
              // Calculate compatibility metrics
              const totalNeeded = seeker.skillsNeeded.length;
              const matchesCount = seeker.skillsNeeded.filter(skill =>
                userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
              ).length;
              const affinityScore = totalNeeded > 0 ? Math.round((matchesCount / totalNeeded) * 100) : 0;

              return (
                <motion.div
                  key={seeker.id}
                  layoutId={`seeker-${seeker.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow hover:border-mzansi-green transition-all duration-200 flex flex-col gap-4 relative overflow-hidden font-sans"
                >
                  {/* Matching Indicator Ribbon */}
                  <div className="absolute top-0 right-0">
                    <div className={`px-4 py-1.5 text-[9px] font-extrabold uppercase rounded-bl-xl tracking-wider border-l border-b ${
                      affinityScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      affinityScore >= 40 ? 'bg-amber-50 text-amber-800 border-amber-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {affinityScore}% Skill Alignment
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pr-32 pt-1 text-left">
                    {seeker.avatar && seeker.avatar.startsWith('http') ? (
                      <img
                        src={seeker.avatar}
                        alt={seeker.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-normal shrink-0 shadow-md">
                        {seeker.avatar}
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-bold text-slate-950 leading-none">{seeker.name}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1 inline-flex items-center gap-1">
                        <Building size={11} className="text-slate-300" />
                        <span>{seeker.title} at </span>
                        <span className="font-bold text-slate-500">{seeker.company}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-2xs leading-relaxed font-normal">
                    {seeker.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Skills Demanded:</span>
                     <div className="flex flex-wrap gap-1.5">
                      {seeker.skillsNeeded.map((skill, index) => {
                        const isMatch = userSkills.some(us => us.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={index}
                            className={`text-[10px] items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                              isMatch
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}
                          >
                            {skill} {isMatch && '✓'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 font-black text-[11px]">
                        R
                      </div>
                      <span className="text-2xs font-bold text-slate-500">Budget Range: </span>
                      <span className="text-2xs font-extrabold text-slate-800">{seeker.budget}</span>
                    </div>

                    {seeker.contactStatus === 'contacted' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-100">
                        <UserCheck size={12} />
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleContact(seeker.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-mzansi-green hover:bg-mzansi-green/90 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-mzansi-green/20 hover:shadow-lg"
                      >
                        <Send size={11} />
                        Contact
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredSeekers.length === 0 && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
                <p className="text-sm text-slate-400 font-medium">No talent seekers exist in this index matching your criteria.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Recruiter Seeker Form */}
      <AnimatePresence>
        {showAddSeekerForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSeekerForm(false)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
            />            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl border border-slate-200 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAddSeekerForm(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-base font-bold text-slate-905 text-slate-900 tracking-tight mb-5">Register Mzansi Recruiter / Hiring Partner</h3>

              <form onSubmit={handlePostSeeker} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Recruiter Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Adams"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Hiring Company</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stark Enterprises"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Professional Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lead Talent Acquisition"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Budget / compensation range</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. R350 - R500 / hr"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Hiring Intent / Project Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe what specific freelance competencies, terms, or milestones you are searching for..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-mzansi-green resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-black text-slate-400 uppercase tracking-wider">Key Competencies Required (Comma list)</label>
                  <input
                    type="text"
                    placeholder="React, Motion, Three.js, Node.js"
                    value={newSkillsStr}
                    onChange={(e) => setNewSkillsStr(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-mzansi-green"
                  />
                </div>

                {/* Face Protection Security Block (Auto profile picture display) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-2xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👤 VERIFIED FACE PORTRAIT</span>
                      <span className="text-[9px] text-mzansi-green font-black border border-mzansi-green/35 px-2 py-0.5 bg-emerald-50 rounded-md">
                        AUTOMATICALLY DISPLAYED
                      </span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">SA Anti-Bot Rules 🇿🇦</span>
                  </div>

                  {profile.avatar ? (
                    <div className="flex items-center gap-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-left">
                      <img
                        src={profile.avatar}
                        alt="Your verified profile face"
                        className="w-12 h-12 rounded-xl object-cover shadow-sm border border-emerald-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">✅ Linked Portal Picture Active</span>
                        <p className="text-[10px] text-emerald-600 font-semibold leading-normal">
                          Your pre-verified face photo from your main profile is automatically loaded and displayed for this recruiter registry.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                      <span className="text-2xs font-extrabold text-amber-800 uppercase tracking-wider block">⚠️ No Profile Picture Active</span>
                      <p className="text-[10px] text-amber-700/95 font-semibold leading-normal mt-1">
                        You have not uploaded a verified face portrait to your main profile yet. You can upload or link a valid human face portrait below.
                      </p>
                    </div>
                  )}

                  {/* Manual / Fall-back upload or URL options */}
                  <div className="space-y-3.5 pt-3 border-t border-slate-200">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Upload or Replace Picture:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 text-2xs font-extrabold rounded-xl cursor-pointer transition select-none uppercase tracking-wider group">
                        <Upload size={13} className="text-slate-500 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Choose file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  validateRecruiterFace(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <div className="flex-1 min-w-[200px] flex flex-col gap-1 text-left">
                        <input
                          type="text"
                          placeholder="Or paste direct image URL"
                          value={newAvatar}
                          onChange={(e) => {
                            setNewAvatar(e.target.value);
                            setDeclinedError('');
                          }}
                          onBlur={(e) => validateRecruiterFace(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              validateRecruiterFace(newAvatar);
                            }
                          }}
                          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none w-full"
                        />
                      </div>

                      {newAvatar && (
                        <div className="relative flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                            <img
                              src={newAvatar}
                              alt="Recruiter custom portrait preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewAvatar('');
                              setValidationError('');
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 rounded-xl text-3xs font-black uppercase transition-colors flex items-center gap-1 cursor-pointer"
                            title="Clear photo"
                          >
                            <X size={10} />
                            <span>Clear</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isValidatingFace && (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 text-xs font-semibold animate-pulse text-left">
                        <Sparkles size={14} className="animate-spin text-indigo-600" />
                        <span>🤖 AI Face Checker is validating portrait... Please wait.</span>
                      </div>
                    )}

                    {validationError && (
                      <div className="text-2xs font-extrabold text-red-500 uppercase tracking-wider bg-red-50 border border-red-150 rounded-2xl px-4 py-2 text-left">
                        ❌ {validationError}
                      </div>
                    )}
                  </div>

                  {declinedError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-50 border border-red-200 text-red-700 text-3xs rounded-xl font-bold leading-relaxed shadow-sm w-full text-left"
                    >
                      {declinedError}
                    </motion.div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddSeekerForm(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Discard Seeker
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-mzansi-green hover:bg-mzansi-green/90 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-mzansi-green/20 transition-colors"
                  >
                    Register Profile
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

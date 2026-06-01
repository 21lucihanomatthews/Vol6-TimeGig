import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfileData, GigItem, SeekerItem } from '../types';
import { Edit2, Sparkles, DollarSign, Mail, Globe, Github, Plus, X, Check, Camera, Upload, Briefcase, MessageSquare, Clock, Trash2 } from 'lucide-react';

interface UserProfileProps {
  profile: UserProfileData;
  setProfile: (profile: UserProfileData) => void;
  gigs: GigItem[];
  setGigs: (gigs: GigItem[]) => void;
  appliedGigs: string[];
  seekers: SeekerItem[];
  onLogout: () => void;
}

export default function UserProfile({ profile, setProfile, gigs, setGigs, appliedGigs, seekers, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileTab, setProfileTab] = useState<'applications' | 'postings' | 'recruiters'>('applications');
  const [editedName, setEditedName] = useState(profile.name);
  const [editedSurname, setEditedSurname] = useState(profile.surname || '');
  const [editedTitle, setEditedTitle] = useState(profile.title);
  const [editedRate, setEditedRate] = useState(profile.hourlyRate);
  const [editedBio, setEditedBio] = useState(profile.bio);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  const [editedGithub, setEditedGithub] = useState(profile.github);
  const [editedWebsite, setEditedWebsite] = useState(profile.website);
  const [editedAvatar, setEditedAvatar] = useState(profile.avatar);

  const [newSkill, setNewSkill] = useState('');
  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateFace = async (imageUrl: string) => {
    if (!imageUrl) {
      setEditedAvatar('');
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
        setEditedAvatar('');
        alert(`⚠️ PROFILE PICTURE REMOVED IMMEDIATELY\n\nOur built-in Face Check AI detected that this photo is not a real human face or portrait profile picture.\n\nReason: ${data.message || 'No face found.'}\n\nPlease choose or upload a real photo.`);
      } else {
        setEditedAvatar(imageUrl);
        setValidationError('');
      }
    } catch (err: any) {
      console.error("Error verifying face:", err);
      // Fallback gracefully so we don't lock up if the server is starting up
      setEditedAvatar(imageUrl);
    } finally {
      setIsValidatingFace(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidatingFace) {
      alert("Please wait while our Face Check AI completes validation...");
      return;
    }
    setProfile({
      ...profile,
      name: editedName,
      surname: editedSurname,
      title: editedTitle,
      hourlyRate: Number(editedRate),
      bio: editedBio,
      email: editedEmail,
      github: editedGithub,
      website: editedWebsite,
      avatar: editedAvatar,
    });
    setIsEditing(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const fullName = `${profile.name} ${profile.surname || ''}`.trim();

  const myPostings = gigs.filter(gig => 
    gig.company.toLowerCase() === profile.name.toLowerCase() || 
    (profile.surname && gig.company.toLowerCase() === profile.surname.toLowerCase()) ||
    gig.company.toLowerCase() === fullName.toLowerCase() ||
    gig.company.toLowerCase() === 'sipho khumalo'
  );

  const myApplications = gigs.filter(gig => appliedGigs.includes(gig.id));

  const contactedRecruiters = seekers.filter(seeker => seeker.contactStatus === 'contacted');

  const handleDeletePosting = (gigId: string) => {
    if (confirm('Are you sure you want to delete this casual job listing?')) {
      setGigs(gigs.filter(g => g.id !== gigId));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-6">
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap text-left">
              {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/') || profile.avatar.startsWith('data:')) ? (
                <img
                  src={profile.avatar}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-2xl object-cover shadow-md shadow-mzansi-green/10 border-2 border-mzansi-gold/80"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-mzansi-green text-white flex items-center justify-center font-black text-5xl tracking-tight shadow-md shadow-mzansi-green/20 uppercase border border-mzansi-gold/60">
                  {fullName.split(' ').map(n => n[0]).join('').substring(0, 3)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h2>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">Active Mzansi Profile</span>
                </div>
                <p className="text-xs text-mzansi-green font-black tracking-wide uppercase">{profile.title}</p>
              </div>
            </div>

            <button
              id="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4.5 py-2.5 border border-mzansi-gold/50 rounded-xl text-xs font-black bg-mzansi-warm hover:bg-amber-50 text-neutral-800 transition-colors cursor-pointer shadow-sm"
            >
              <Edit2 size={13} className="text-mzansi-gold" />
              {isEditing ? '❌ Close Settings Panel' : '✍️ Edit My Profile Details'}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4.5 py-2.5 border border-red-200 rounded-xl text-xs font-black bg-red-50 hover:bg-red-100 text-red-800 transition-colors cursor-pointer shadow-sm"
            >
              🚪 Logout
            </button>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
            <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider mb-1">My Personal Bio Statement:</p>
            <p className="text-slate-600 text-sm leading-relaxed font-normal italic">
              "{profile.bio}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-100">
            {/* Pay rate widget */}
            <div className="flex items-center gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/65">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-emerald-200">
                R
              </div>
              <div>
                <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wide">🇿🇦 My Hourly Pay</p>
                <p className="text-sm font-black text-slate-800">R {profile.hourlyRate}/hr</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight">ZAR Rand earned</p>
              </div>
            </div>

            {/* Finished gigs widget */}
            <div className="flex items-center gap-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wide">📈 Finished Gigs</p>
                <p className="text-sm font-black text-slate-800">{profile.metrics.gigsCompleted} Gigs Done</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight">Jobs completed</p>
              </div>
            </div>

            {/* Rating widget */}
            <div className="flex items-center gap-3 sm:col-span-1 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/60">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-lg font-black leading-none">★</span>
              </div>
              <div>
                <p className="text-[9px] text-amber-700 font-extrabold uppercase tracking-wide">⭐ Happy Clients</p>
                <p className="text-sm font-black text-slate-800">{profile.metrics.rating} Rating</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight">Out of 5.0 score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editing Panel */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-600/30 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2 bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                  <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest">✏️ Step-by-Step Settings Panel</h3>
                  <p className="text-[10px] text-indigo-600 font-semibold">Change your profile basics below. Everything is kept inside your browser memory.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    required
                    placeholder="e.g. Sipho"
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Surname (Last Name)</label>
                  <input
                    type="text"
                    value={editedSurname}
                    onChange={(e) => setEditedSurname(e.target.value)}
                    required
                    placeholder="e.g. Khumalo"
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5 animate-pulse-subtle">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Hourly Pay (ZAR Rands R) (How much per hour?)</label>
                  <input
                    type="number"
                    value={editedRate}
                    onChange={(e) => setEditedRate(Number(e.target.value))}
                    required
                    min="1"
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">My Title (What do you do best?)</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    required
                    placeholder="e.g. Graphic Designer / Frontend Coder"
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">My Summary (Tell clients why you're great!)</label>
                  <textarea
                    rows={3}
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    required
                    placeholder="Briefly pitch what makes you great so clients hire you instantly."
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Website URL Link (Optional)</label>
                  <input
                    type="text"
                    value={editedWebsite}
                    onChange={(e) => setEditedWebsite(e.target.value)}
                    placeholder="e.g. https://myprofile.com"
                    className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="col-span-2 bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 space-y-4">
                  <span className="text-2xs font-black text-indigo-950 uppercase tracking-widest block">👤 Custom Real Face Photo</span>
                  
                  <div className="grid grid-cols-1 gap-4 font-sans">
                    {/* Device Upload option box */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                      <div>
                        <span className="text-2xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                          <span>📸 Upload Your Actual Photo</span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">Your Device</span>
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1">
                          Select a real high-quality portrait or photo from your phone or computer. If no real photo is uploaded, your personalized initials avatar will automatically display.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-400 text-indigo-800 text-xs font-bold rounded-xl cursor-pointer transition active:scale-95 select-none group">
                          <Upload size={14} className="text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
                          <span>Choose local file</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    validateFace(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {/* Custom URL Option inline */}
                        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Or Paste Photo URL Link</span>
                          <input
                            type="text"
                            placeholder="e.g. https://myphoto.com/me.jpg"
                            value={editedAvatar}
                            onChange={(e) => setEditedAvatar(e.target.value)}
                            onBlur={(e) => validateFace(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                validateFace(editedAvatar);
                              }
                            }}
                            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none w-full"
                          />
                        </div>

                        {/* Live upload preview / Clear */}
                        {editedAvatar && (
                          <div className="relative flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm shrink-0">
                              <img
                                src={editedAvatar}
                                alt="Local Custom Portrait preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditedAvatar('');
                                setValidationError('');
                              }}
                              className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 rounded-xl text-2xs font-extrabold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                              title="Clear photo"
                            >
                              <X size={12} />
                              <span>Clear Photo</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* AI Checking loaders and diagnostics */}
                      {isValidatingFace && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 text-xs font-semibold animate-pulse">
                          <Sparkles size={14} className="animate-spin text-indigo-600" />
                          <span>🤖 AI Face Checker is validating portrait... Please wait.</span>
                        </div>
                      )}

                      {validationError && (
                        <div className="text-2xs font-extrabold text-red-500 uppercase tracking-wider bg-red-50 border border-red-100 rounded-2xl px-4 py-2">
                          ❌ {validationError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-3 pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    ❌ Cancel changes
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-mzansi-green hover:bg-mzansi-green/90 text-white rounded-xl text-xs font-black shadow-md shadow-mzansi-green/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    💾 Save changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills Management Panel */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>🛠️ My Skills & Talents</span>
              <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-black tracking-normal uppercase">
                {profile.skills.length} skills active
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Click any skill below to delete it from your directory profile</p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5 pt-2">
            <AnimatePresence>
              {profile.skills.map((skill) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-bold border border-slate-100 transition-colors group cursor-pointer"
                  onClick={() => handleRemoveSkill(skill)}
                  title="Click to remove skill"
                >
                  {skill}
                  <X size={12} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Type any other skill tag (e.g. Illustrator, Python) and click the (+)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 placeholder-slate-400 rounded-xl border border-slate-150 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="px-5 bg-mzansi-green hover:bg-mzansi-green/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer shadow-md shadow-mzansi-green/15"
              title="Add this skill"
            >
              <Plus size={16} /> Add Skill
            </button>
          </form>

          {/* Quick Click-to-add popular suggestion badges */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2.5">💡 Quick Suggestion tags (click to add instantly):</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Figma', 'Node.js', 'Python', 'WordPress', 'Copywriting', 'SEO', 'AI Prompting', 'No-Code'].map((tag) => {
                const alreadyHas = profile.skills.some(s => s.toLowerCase() === tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={alreadyHas}
                    onClick={() => {
                      if (!alreadyHas) {
                        setProfile({
                          ...profile,
                          skills: [...profile.skills, tag]
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide transition-all cursor-pointer border ${
                      alreadyHas
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-40'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100/70 hover:shadow-sm active:scale-95'
                    }`}
                  >
                    + {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Links & Rate History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Channels / Contact details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Channels</h3>
            <div className="space-y-3.5">
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-xs text-slate-600 hover:text-indigo-600 font-medium group transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                  <Globe size={14} />
                </div>
                <span className="truncate">{profile.website}</span>
              </a>
            </div>
          </div>

          {/* Rate Tracker (Minimal dynamic styling) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Rate Appreciation</h3>
              <p className="text-2xs text-slate-400 font-semibold mb-3 tracking-wide">PREVIOUS BILLING MILESTONES (ZAR Rands)</p>
            </div>

            <div className="flex items-end justify-between gap-4 h-20 px-2">
              {profile.metrics.hourlyRateHistory.map((history, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative bg-slate-100 rounded-t-lg overflow-hidden" style={{ height: `${(history.rate / 800) * 100}%`, minHeight: '15px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      className="absolute inset-0 bg-mzansi-gold origin-bottom"
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-800">R {history.rate}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{history.date}</p>
                  </div>
                </div>
              ))}

              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-100 rounded-t-lg overflow-hidden" style={{ height: `${(profile.hourlyRate / 800) * 100}%`, minHeight: '15px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    className="absolute inset-0 bg-mzansi-green origin-bottom"
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-mzansi-green">R {profile.hourlyRate}</p>
                  <p className="text-[9px] font-bold text-mzansi-gold uppercase tracking-widest">Now</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Activity / Portfolio Center */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-5 text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>📁 My Active Portfolio & Hub</span>
              <span className="text-[10px] bg-mzansi-gold/10 text-amber-800 border border-mzansi-gold/20 px-2 py-0.5 rounded uppercase font-black">Live Status</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-relaxed">
              Track jobs you have applied to, casual gigs you posted, or recruiter profiles you initiated contact with!
            </p>
          </div>

          {/* SA Green Interactive Segment Toggles */}
          <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 p-1.5 rounded-2xl mb-5 text-2xs md:text-xs font-black gap-1 text-slate-600">
            <button
              onClick={() => setProfileTab('applications')}
              className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all uppercase tracking-wider select-none ${
                profileTab === 'applications'
                  ? 'bg-mzansi-green text-white shadow-md border border-mzansi-gold/30'
                  : 'hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              💼 Applications ({myApplications.length})
            </button>
            <button
              onClick={() => setProfileTab('postings')}
              className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all uppercase tracking-wider select-none ${
                profileTab === 'postings'
                  ? 'bg-mzansi-green text-white shadow-md border border-mzansi-gold/30'
                  : 'hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              ✍️ Job Postings ({myPostings.length})
            </button>
            <button
              onClick={() => setProfileTab('recruiters')}
              className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all uppercase tracking-wider select-none ${
                profileTab === 'recruiters'
                  ? 'bg-mzansi-green text-white shadow-md border border-mzansi-gold/30'
                  : 'hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              🤝 Contacted ({contactedRecruiters.length})
            </button>
          </div>

          {/* Interactive Screen Lists */}
          <div className="space-y-3.5 pr-0.5 max-h-96 overflow-y-auto scrollbar-thin">
            {profileTab === 'applications' && (
              <div className="space-y-3">
                {myApplications.length > 0 ? (
                  myApplications.map((gig) => (
                    <div key={gig.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-mzansi-green/30 transition-colors">
                      <div className="flex gap-3.5 items-center text-left min-w-0">
                        {gig.picture ? (
                          <img
                            src={gig.picture}
                            alt={gig.title}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold font-mono">
                            G
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">🏢 {gig.company}</p>
                          <h4 className="text-xs font-black text-slate-900 truncate leading-snug">{gig.title}</h4>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md mt-1 inline-block">
                            R {gig.budget} ({gig.paymentType})
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                        <span className="text-[8.5px] font-black tracking-widest uppercase bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full whitespace-nowrap animate-pulse-subtle">
                          ● Under Review
                        </span>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Submitted today</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-extrabold mb-1 uppercase tracking-wide">No Active Applications</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
                      Navigate to the <b>Gigs</b> tab, choose an interesting job match, and select "Submit Easy Application".
                    </p>
                  </div>
                )}
              </div>
            )}

            {profileTab === 'postings' && (
              <div className="space-y-3">
                {myPostings.length > 0 ? (
                  myPostings.map((gig) => (
                    <div key={gig.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center gap-4 hover:border-mzansi-green/30 transition-colors">
                      <div className="flex gap-3.5 items-center text-left min-w-0">
                        {gig.picture ? (
                          <img
                            src={gig.picture}
                            alt={gig.title}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-mzansi-green text-white flex items-center justify-center font-bold">
                            Z
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-mzansi-green uppercase tracking-wider">🏢 Posted by you</p>
                          <h4 className="text-xs font-black text-slate-900 truncate leading-snug">{gig.title}</h4>
                          <span className="text-[9px] font-bold text-slate-500 mt-1 block">R {gig.budget} ({gig.paymentType}) • {gig.location}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          Active SA
                        </span>
                        <button
                          onClick={() => handleDeletePosting(gig.id)}
                          className="p-1 px-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-150 transition-colors cursor-pointer"
                          title="Delete gig listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-extrabold mb-1 uppercase tracking-wide">No Gigs Listed By You</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
                      Need helper services or small chores done? Click <b>Post Simple Job</b> inside the <b>Gigs</b> tab to hire someone instantly!
                    </p>
                  </div>
                )}
              </div>
            )}

            {profileTab === 'recruiters' && (
              <div className="space-y-3">
                {contactedRecruiters.length > 0 ? (
                  contactedRecruiters.map((seeker) => (
                    <div key={seeker.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center gap-4 hover:border-mzansi-green/30 transition-colors">
                      <div className="flex gap-3.5 items-center text-left min-w-0">
                        {seeker.avatar ? (
                          <img
                            src={seeker.avatar}
                            alt={seeker.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                            {seeker.name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">🏢 {seeker.company}</p>
                          <h4 className="text-xs font-black text-slate-900 truncate leading-snug">{seeker.name}</h4>
                          <p className="text-[9px] text-mzansi-green font-extrabold uppercase tracking-wide">{seeker.title}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[8px] font-black bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-widest">
                          💬 Connect Open
                        </span>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">Chat live</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-extrabold mb-1 uppercase tracking-wide">No Recruiters Contacted</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
                      Navigate to the <b>Seekers</b> list, tap any recruiter's portfolio card and hit <b>Contact Recruiter Account</b> to connect!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

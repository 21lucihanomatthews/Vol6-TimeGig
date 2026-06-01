import { createClient } from '@supabase/supabase-js';
import { UserProfileData, GigItem, SeekerItem } from '../types';
import { initialProfile, initialGigs, initialSeekers } from '../data/mockData';

// Provided Supabase config
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fhziezueyewyniixrvqx.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemllenVleWV3eW5paXhydnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxNzQsImV4cCI6MjA5NTg2ODE3NH0.2asFgQBmmgcw2ASaBIVU6UxCrU76HPvf7JrCxuEE4sM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Flag to track check status
export interface DbTableStatus {
  profileExists: boolean;
  gigsExists: boolean;
  seekersExists: boolean;
  appliedGigsExists: boolean;
  error?: string;
}

export const SQL_SCHEMA = `-- TimeGIG SA Supabase Setup Script 🇿🇦
-- Copy and paste this script into your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Then hit "Run" to establish all backend storage structures!

-- 1. Create Profile Table
CREATE TABLE IF NOT EXISTS profile (
  id text PRIMARY KEY,
  name text NOT NULL,
  surname text,
  avatar text,
  title text NOT NULL,
  hourly_rate numeric NOT NULL,
  bio text,
  skills jsonb NOT NULL,
  email text NOT NULL,
  website text,
  github text,
  metrics jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) or allow public read/write for non-auth demos
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profile access" ON profile FOR ALL USING (true) WITH CHECK (true);

-- 2. Create Gigs Table
CREATE TABLE IF NOT EXISTS gigs (
  id text PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL,
  payment_type text NOT NULL,
  duration text NOT NULL,
  tags jsonb NOT NULL,
  location text NOT NULL,
  difficulty text NOT NULL,
  created_at text NOT NULL,
  picture text,
  pictures jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public gigs access" ON gigs FOR ALL USING (true) WITH CHECK (true);

-- 3. Create Seekers Table
CREATE TABLE IF NOT EXISTS seekers (
  id text PRIMARY KEY,
  name text NOT NULL,
  company text NOT NULL,
  avatar text,
  title text NOT NULL,
  description text NOT NULL,
  budget text NOT NULL,
  skills_needed jsonb NOT NULL,
  contact_status text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seekers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public seekers access" ON seekers FOR ALL USING (true) WITH CHECK (true);

-- 4. Create Applied Gigs Table
CREATE TABLE IF NOT EXISTS applied_gigs (
  id text PRIMARY KEY,
  gig_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE applied_gigs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public applications access" ON applied_gigs FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Initial Mzansi Developer Profile
INSERT INTO profile (id, name, surname, avatar, title, hourly_rate, bio, skills, email, website, github, metrics)
VALUES (
  'current_user',
  'Sipho',
  'Khumalo',
  '',
  'Senior Full-Stack & Tailwind Developer',
  450,
  'Howzit! I''m Sipho, a passionate developer based in Cape Town. I build extremely easy-to-use modern React web apps and high-performance Tailwind systems for South African startups and international partners. Let''s grow your digital presence!',
  '["React", "TypeScript", "Tailwind CSS", "WordPress", "Node.js", "SEO Coding", "No-Code Apps"]',
  'sipho.khumalo@timegig.co.za',
  'https://siphocode.co.za',
  'https://github.com/siphokhumalo',
  '{"rating": 4.95, "gigsCompleted": 58, "hourlyRateHistory": [{"rate": 300, "date": "Jan"}, {"rate": 380, "date": "Mar"}, {"rate": 450, "date": "Jun"}]}'
) ON CONFLICT (id) DO NOTHING;

-- 6. Seed Initial South African Gigs
INSERT INTO gigs (id, title, company, description, budget, payment_type, duration, tags, location, difficulty, created_at, picture, pictures)
VALUES
('gig-1', 'Upload 50 Rooibos Tea Product Images to WooCommerce Shop', 'Berg River Proteas Co.', 'Easy casual content entry task! We have the product pictures and text descriptions catalogued neatly in a Google Drive folder.', 950, 'Fixed', '1 day', '["WordPress", "No-Code Apps"]', 'Remote', 'Entry', '1h ago', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300', '["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400"]'),
('gig-2', 'Update Tailwind Style Palette on Biltong App Checkout Page', 'Jozi Meats Ltd', 'Tweak our POS web layout buttons. Change our primary brand styling to simple warm South African themed colors.', 350, 'Hourly', '2 hours', '["Tailwind CSS", "React"]', 'Remote', 'Entry', '4h ago', 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=300', '["https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=400"]'),
('gig-3', 'Configure Dynamic Touch Photo Gallery for Kruger Safari Site', 'Kruger Escape Safaris', 'Build an interactive, lightweight image carousel utilizing responsive motion/react.', 1800, 'Fixed', '4 hours', '["React", "Tailwind CSS"]', 'Remote', 'Intermediate', '1d ago', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=300', '["https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=400"]'),
('gig-4', 'Insert Multi-language Zulu/Xhosa Plain Placeholders in Contact Page', 'Township Commerce Hub', 'We have compiled lists of simple text translations in a text note. Modify our single static forms file.', 1200, 'Fixed', '1 day', '["React", "TypeScript"]', 'Remote', 'Intermediate', '2d ago', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=300', '["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"]'),
('gig-5', 'Refactor Squished Mobile Grid Padding for Solar Status Widget', 'GreenCape Power SA', 'Adjust responsive layout boundaries on our loadshedding layout widget.', 450, 'Hourly', '3 hours', '["Tailwind CSS", "React"]', 'Remote', 'Entry', '3d ago', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=300', '["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400"]');

-- 7. Seed Initial Seekers (Recruiters)
INSERT INTO seekers (id, name, company, avatar, title, description, budget, skills_needed, contact_status)
VALUES
('seeker-1', 'Lindiwe Dlamini', 'Mzansi Tech Launchpad', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', 'Talent Acquisition Officer', 'Howzit! We are looking for energetic, hard-working South African youth developers to build landing layouts.', 'R300 - R480 / hr', '["React", "Tailwind CSS", "TypeScript"]', 'idle'),
('seeker-2', 'Thabo Ndlovu', 'Table Mountain Agencies', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', 'Digital Project Lead', 'Hiring creative frontend freelancers who understand clean web layouts.', 'R400 - R600 / hr', '["React", "SEO Coding", "Tailwind CSS"]', 'idle'),
('seeker-3', 'Pieter Botha', 'Bantu Creative Labs', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', 'Product Specialist', 'Looking for a reliable developer to setup our WordPress store API integration with local payment portals.', 'R35 000 Flat', '["WordPress", "React", "TypeScript"]', 'idle'),
('seeker-4', 'Karabo Molefe', 'SolarSphere South Africa', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200&h=200', 'HR Director', 'Seeking a technical partner to maintain our client onboarding templates.', 'R350 - R500 / hr', '["React", "TypeScript", "Tailwind CSS"]', 'idle');
`;

// Probe tables to see if they exist
export async function getDbStatus(): Promise<DbTableStatus> {
  const result: DbTableStatus = {
    profileExists: false,
    gigsExists: false,
    seekersExists: false,
    appliedGigsExists: false
  };

  try {
    // Check profile
    const { error: profileErr } = await supabase.from('profile').select('id').limit(1).maybeSingle();
    result.profileExists = !profileErr || profileErr.code !== '42P01';

    // Check gigs
    const { error: gigsErr } = await supabase.from('gigs').select('id').limit(1);
    result.gigsExists = !gigsErr || gigsErr.code !== '42P01';

    // Check seekers
    const { error: seekersErr } = await supabase.from('seekers').select('id').limit(1);
    result.seekersExists = !seekersErr || seekersErr.code !== '42P01';

    // Check applied_gigs
    const { error: appliedErr } = await supabase.from('applied_gigs').select('id').limit(1);
    result.appliedGigsExists = !appliedErr || appliedErr.code !== '42P01';

    return result;
  } catch (err: any) {
    console.error("Supabase table probing error:", err);
    result.error = err.message || String(err);
    return result;
  }
}

// 1. Get Profile
export async function fetchProfileFromSupabase(): Promise<UserProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 'current_user')
      .maybeSingle();

    if (error) {
      console.warn("Could not query Supabase profile table, falling back to local storage/mock:", error);
      return null;
    }

    if (data) {
      return {
        name: data.name,
        surname: data.surname || '',
        avatar: data.avatar || '',
        title: data.title,
        hourlyRate: Number(data.hourly_rate),
        bio: data.bio || '',
        skills: Array.isArray(data.skills) ? data.skills : JSON.parse(data.skills || '[]'),
        email: data.email,
        website: data.website || '',
        github: data.github || '',
        metrics: typeof data.metrics === 'object' ? data.metrics : JSON.parse(data.metrics || '{}'),
      };
    }
    return null;
  } catch (err) {
    console.warn("Exception checking supabase profile:", err);
    return null;
  }
}

// 2. Save Profile
export async function saveProfileToSupabase(profile: UserProfileData): Promise<boolean> {
  try {
    const payload = {
      id: 'current_user',
      name: profile.name,
      surname: profile.surname || '',
      avatar: profile.avatar || '',
      title: profile.title,
      hourly_rate: profile.hourlyRate,
      bio: profile.bio || '',
      skills: profile.skills, // jsonb type takes array directly
      email: profile.email,
      website: profile.website || '',
      github: profile.github || '',
      metrics: profile.metrics, // jsonb type takes object directly
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profile')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Error upserting Supabase profile:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception upserting Supabase profile:", err);
    return false;
  }
}

// 3. Get Gigs
export async function fetchGigsFromSupabase(): Promise<GigItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn("Could not fetch 'gigs' table from Supabase:", error);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(itm => ({
        id: itm.id,
        title: itm.title,
        company: itm.company,
        description: itm.description,
        budget: Number(itm.budget),
        paymentType: itm.payment_type as 'Fixed' | 'Hourly',
        duration: itm.duration,
        tags: Array.isArray(itm.tags) ? itm.tags : JSON.parse(itm.tags || '[]'),
        location: itm.location,
        difficulty: itm.difficulty as 'Entry' | 'Intermediate' | 'Expert',
        createdAt: itm.created_at,
        picture: itm.picture || undefined,
        pictures: Array.isArray(itm.pictures) ? itm.pictures : JSON.parse(itm.pictures || '[]'),
      }));
    }
    return null;
  } catch (err) {
    console.warn("Exception fetching gigs from Supabase:", err);
    return null;
  }
}

// 4. Save/Upsert Gig
export async function saveGigToSupabase(gig: GigItem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gigs')
      .upsert({
        id: gig.id,
        title: gig.title,
        company: gig.company,
        description: gig.description,
        budget: gig.budget,
        payment_type: gig.paymentType,
        duration: gig.duration,
        tags: gig.tags,
        location: gig.location,
        difficulty: gig.difficulty,
        created_at: gig.createdAt,
        picture: gig.picture || null,
        pictures: gig.pictures || [],
      }, { onConflict: 'id' });

    if (error) {
      console.error("Error saving gig to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving gig to Supabase:", err);
    return false;
  }
}

// 5. Get Seekers
export async function fetchSeekersFromSupabase(): Promise<SeekerItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('seekers')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn("Could not fetch 'seekers' table from Supabase:", error);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(itm => ({
        id: itm.id,
        name: itm.name,
        company: itm.company,
        avatar: itm.avatar || '',
        title: itm.title,
        description: itm.description,
        budget: itm.budget,
        skillsNeeded: Array.isArray(itm.skills_needed) ? itm.skills_needed : JSON.parse(itm.skills_needed || '[]'),
        contactStatus: itm.contact_status as 'idle' | 'contacted',
      }));
    }
    return null;
  } catch (err) {
    console.warn("Exception fetching seekers from Supabase:", err);
    return null;
  }
}

// 6. Save/Upsert Seeker
export async function saveSeekerToSupabase(seeker: SeekerItem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('seekers')
      .upsert({
        id: seeker.id,
        name: seeker.name,
        company: seeker.company,
        avatar: seeker.avatar || '',
        title: seeker.title,
        description: seeker.description,
        budget: seeker.budget,
        skills_needed: seeker.skillsNeeded,
        contact_status: seeker.contactStatus,
      }, { onConflict: 'id' });

    if (error) {
      console.error("Error saving seeker to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving seeker to Supabase:", err);
    return false;
  }
}

// 7. Get Applied Gigs list
export async function fetchAppliedGigsFromSupabase(): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('applied_gigs')
      .select('gig_id');

    if (error) {
      console.warn("Could not fetch 'applied_gigs' table from Supabase:", error);
      return null;
    }

    if (data) {
      return data.map(itm => itm.gig_id);
    }
    return null;
  } catch (err) {
    console.warn("Exception fetching applied gigs from Supabase:", err);
    return null;
  }
}

// 8. Add Applied Gig application
export async function applyToGigInSupabase(gigId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('applied_gigs')
      .upsert({
        id: `app_${gigId}`,
        gig_id: gigId,
      }, { onConflict: 'id' });

    if (error) {
      console.error("Error applying to gig in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception applying to gig in Supabase:", err);
    return false;
  }
}

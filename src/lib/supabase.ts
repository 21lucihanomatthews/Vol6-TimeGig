import { createClient } from '@supabase/supabase-js';
import { UserProfileData, GigItem, SeekerItem } from '../types';

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
  paymentRequestsExists: boolean;
  chatMessagesExists: boolean;
  error?: string;
}

export const SQL_SCHEMA = `-- TimeGIG SA Complete Database Setup 🇿🇦
-- Copy and paste this script into your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Then hit "Run" to establish all backend storage structures!

-- 1. Create Profile Table
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  name text NOT NULL,
  surname text,
  avatar text,
  title text NOT NULL DEFAULT 'Member',
  hourly_rate numeric NOT NULL DEFAULT 0,
  bio text,
  skills jsonb NOT NULL DEFAULT '[]',
  email text NOT NULL,
  website text,
  github text,
  metrics jsonb NOT NULL DEFAULT '{"rating": 5, "gigsCompleted": 0, "hourlyRateHistory": []}',
  coin_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Profile
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profile access" ON profile;
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
DROP POLICY IF EXISTS "Public gigs access" ON gigs;
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
DROP POLICY IF EXISTS "Public seekers access" ON seekers;
CREATE POLICY "Public seekers access" ON seekers FOR ALL USING (true) WITH CHECK (true);

-- 4. Create Applied Gigs Table
CREATE TABLE IF NOT EXISTS applied_gigs (
  id text PRIMARY KEY,
  gig_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE applied_gigs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public applications access" ON applied_gigs;
CREATE POLICY "Public applications access" ON applied_gigs FOR ALL USING (true) WITH CHECK (true);

-- 5. Create Payment Requests Table
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profile(id),
  coin_package_id text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  proof_of_payment_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON payment_requests;
CREATE POLICY "Users can create their own payment requests" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own payment requests" ON payment_requests;
CREATE POLICY "Users can view their own payment requests" ON payment_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all payment requests" ON payment_requests;
CREATE POLICY "Admins can view all payment requests" ON payment_requests FOR SELECT USING (true);

-- 6. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('text', 'image')) DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public chat access" ON chat_messages;
CREATE POLICY "Public chat access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- 7. Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE payment_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE profile;
`;

// Probe tables to see if they exist
export async function getDbStatus(): Promise<DbTableStatus> {
  const result: DbTableStatus = {
    profileExists: false,
    gigsExists: false,
    seekersExists: false,
    appliedGigsExists: false,
    paymentRequestsExists: false,
    chatMessagesExists: false
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

    // Check payment_requests
    const { error: paymentsErr } = await supabase.from('payment_requests').select('id').limit(1);
    result.paymentRequestsExists = !paymentsErr || paymentsErr.code !== '42P01';

    // Check chat_messages
    const { error: chatErr } = await supabase.from('chat_messages').select('id').limit(1);
    result.chatMessagesExists = !chatErr || chatErr.code !== '42P01';

    return result;
  } catch (err: any) {
    console.error("Supabase table probing error:", err);
    result.error = err.message || String(err);
    return result;
  }
}

// 1. Get Profile
export async function fetchProfileFromSupabase(userId: string): Promise<UserProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
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
export async function saveProfileToSupabase(userId: string, profile: UserProfileData): Promise<boolean> {
  try {
    const payload = {
      id: userId,
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

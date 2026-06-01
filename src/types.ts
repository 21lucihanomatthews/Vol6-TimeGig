export type ActiveTab = 'profile' | 'gigs' | 'seekers' | 'admin';

export interface UserProfileData {
  name: string;
  surname?: string;
  avatar: string; // URL or letter representation
  title: string;
  hourlyRate: number;
  bio: string;
  skills: string[];
  email: string;
  website: string;
  github: string;
  metrics: {
    gigsCompleted: number;
    rating: number;
    hourlyRateHistory: { date: string; rate: number }[];
  };
}

export interface GigItem {
  id: string;
  title: string;
  company: string;
  description: string;
  budget: number;
  paymentType: 'Fixed' | 'Hourly';
  duration: string;
  tags: string[];
  location: string;
  difficulty: 'Entry' | 'Intermediate' | 'Expert';
  createdAt: string;
  picture?: string;
  pictures?: string[];
}

export interface SeekerItem {
  id: string;
  name: string;
  company: string;
  avatar: string;
  title: string;
  description: string;
  budget: string;
  skillsNeeded: string[];
  contactStatus: 'idle' | 'contacted';
}

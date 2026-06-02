export type ActiveTab = 'profile' | 'gigs' | 'seekers' | 'admin' | 'chat';

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
  coinBalance?: number;
  metrics: {
    gigsCompleted: number;
    rating: number;
    hourlyRateHistory: { date: string; rate: number }[];
    coinBalance?: number;
  };
}

export interface PaymentRequest {
  id: string;
  userId: string;
  coinPackageId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proofOfPaymentUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'document';
  createdAt: string;
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

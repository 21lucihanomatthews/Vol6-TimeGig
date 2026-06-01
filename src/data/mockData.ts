import { UserProfileData, GigItem, SeekerItem } from '../types';

export const initialProfile: UserProfileData = {
  name: "Sipho",
  surname: "Khumalo",
  avatar: "",
  title: "Senior Full-Stack & Tailwind Developer",
  hourlyRate: 450,
  bio: "Howzit! I'm Sipho, a passionate developer based in Cape Town. I build extremely easy-to-use modern React web apps and high-performance Tailwind systems for South African startups and international partners. Let's grow your digital presence!",
  skills: ["React", "TypeScript", "Tailwind CSS", "WordPress", "Node.js", "SEO Coding", "No-Code Apps"],
  email: "sipho.khumalo@timegig.co.za",
  website: "https://siphocode.co.za",
  github: "https://github.com/siphokhumalo",
  metrics: {
    gigsCompleted: 58,
    rating: 4.95,
    hourlyRateHistory: [
      { date: 'Jan', rate: 300 },
      { date: 'Mar', rate: 380 },
      { date: 'Jun', rate: 450 },
    ]
  }
};

export const initialGigs: GigItem[] = [
  {
    id: "gig-1",
    title: "Upload 50 Rooibos Tea Product Images to WooCommerce Shop",
    company: "Berg River Proteas Co.",
    description: "Easy casual content entry task! We have the product pictures and text descriptions catalogued neatly in a Google Drive folder. You just need to create the items on our WordPress WooCommerce dashboard.",
    budget: 950,
    paymentType: "Fixed",
    duration: "1 day",
    tags: ["WordPress", "No-Code Apps"],
    location: "Remote",
    difficulty: "Entry",
    createdAt: "1h ago",
    picture: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=300",
    pictures: [
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1563315629-c886ae0875da?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1594631252845-29fc4589947e?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "gig-2",
    title: "Update Tailwind Style Palette on Biltong App Checkout Page",
    company: "Jozi Meats Ltd",
    description: "Tweak our POS web layout buttons. Change our primary brand styling to simple warm South African themed colors (Gold/Green) using simple Tailwind classes.",
    budget: 350,
    paymentType: "Hourly",
    duration: "2 hours",
    tags: ["Tailwind CSS", "React"],
    location: "Remote",
    difficulty: "Entry",
    createdAt: "4h ago",
    picture: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=300",
    pictures: [
      "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "gig-3",
    title: "Configure Dynamic Touch Photo Gallery for Kruger Safari Site",
    company: "Kruger Escape Safaris",
    description: "Build an interactive, lightweight image carousel utilizing responsive motion/react. Smooth CSS transitions should guide users viewing chalet interior photos casually.",
    budget: 1800,
    paymentType: "Fixed",
    duration: "4 hours",
    tags: ["React", "Tailwind CSS"],
    location: "Remote",
    difficulty: "Intermediate",
    createdAt: "1d ago",
    picture: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=300",
    pictures: [
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "gig-4",
    title: "Insert Multi-language Zulu/Xhosa Plain Placeholders in Contact Page",
    company: "Township Commerce Hub",
    description: "We have compiled lists of simple text translations in a text note. Modify our single static forms file to implement a language toggle dropdown that swaps out the form labels.",
    budget: 1200,
    paymentType: "Fixed",
    duration: "1 day",
    tags: ["React", "TypeScript"],
    location: "Remote",
    difficulty: "Intermediate",
    createdAt: "2d ago",
    picture: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=300",
    pictures: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "gig-5",
    title: "Refactor Squished Mobile Grid Padding for Solar Status Widget",
    company: "GreenCape Power SA",
    description: "Adjust responsive layout boundaries on our loadshedding layout widget. Standardize tracking, spacing and reduce margins to render nicely on mobile keypads.",
    budget: 450,
    paymentType: "Hourly",
    duration: "3 hours",
    tags: ["Tailwind CSS", "React"],
    location: "Remote",
    difficulty: "Entry",
    createdAt: "3d ago",
    picture: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=300",
    pictures: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1497435142211-0010996be4b2?auto=format&fit=crop&q=80&w=400"
    ]
  }
];

export const initialSeekers: SeekerItem[] = [
  {
    id: "seeker-1",
    name: "Lindiwe Dlamini",
    company: "Mzansi Tech Launchpad",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
    title: "Talent Acquisition Officer",
    description: "Howzit! We are looking for energetic, hard-working South African youth developers to build landing layouts for township retail clients. Quick payment terms upon delivery.",
    budget: "R300 - R480 / hr",
    skillsNeeded: ["React", "Tailwind CSS", "TypeScript"],
    contactStatus: "idle"
  },
  {
    id: "seeker-2",
    name: "Thabo Ndlovu",
    company: "Table Mountain Agencies",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    title: "Digital Project Lead",
    description: "Hiring creative frontend freelancers who understand clean web layouts and simple mobile responsive design. High attention to beautiful South African typography & local color schemes.",
    budget: "R400 - R600 / hr",
    skillsNeeded: ["React", "SEO Coding", "Tailwind CSS"],
    contactStatus: "idle"
  },
  {
    id: "seeker-3",
    name: "Pieter Botha",
    company: "Bantu Creative Labs",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    title: "Product Specialist",
    description: "Looking for a reliable developer to setup our WordPress store API integration with local payment portals (PayFast / Yoco). Simple instructions, no guesswork.",
    budget: "R35 000 Flat",
    skillsNeeded: ["WordPress", "React", "TypeScript"],
    contactStatus: "idle"
  },
  {
    id: "seeker-4",
    name: "Karabo Molefe",
    company: "SolarSphere South Africa",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200&h=200",
    title: "HR Director",
    description: "Seeking a technical partner to maintain our client onboarding templates. Simple form fields, highly legible text, beautiful mobile spacing.",
    budget: "R350 - R500 / hr",
    skillsNeeded: ["React", "TypeScript", "Tailwind CSS"],
    contactStatus: "idle"
  }
];

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // "Full-time", "Contract", etc.
  postedAt: string;
  description: string; // A short summary
  fullDescription?: string; // Generated on demand
  tags: string[];
  logoUrl?: string; // Placeholder
  matchScore?: number; // AI calculated fit
  applyUrl?: string; // Real link to the job
}

export interface JobCategory {
  title: string;
  description: string;
  jobs: Job[];
}

export type ViewState = 'search' | 'discovery' | 'saved' | 'profile';

export interface SearchFilters {
  remote: boolean;
  minSalary: number;
  jobTypes: string[];
  experienceLevel: string;
  prioritySkills?: string[];
  preferredCompanies?: string[];
}

export interface VoiceSearchParams {
  query: string;
  location: string;
  filters: SearchFilters;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  currentRole: string;
  bio: string;
  skills: string[];
  yearsExperience: number;
  preferences: {
    remote: boolean;
    minSalary: number;
    locations: string[];
  };
  dislikedJobs?: { title: string; company: string }[];
}
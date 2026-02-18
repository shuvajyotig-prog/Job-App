import { GoogleGenAI, Type } from "@google/genai";
import { Job, JobCategory, SearchFilters, UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- FALLBACK DATA (For when API Quota is exceeded) ---
const FALLBACK_JOBS: Job[] = [
  {
    id: 'fb-1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Solutions',
    location: 'Bangalore, India',
    salary: '₹24L - ₹35L LPA',
    type: 'Full-time',
    postedAt: '2 days ago',
    description: 'We are looking for an experienced Frontend Engineer to lead our core product team. You will work with React, TypeScript, and Next.js to build scalable web applications.',
    tags: ['React', 'TypeScript', 'Next.js', 'Redux'],
    matchScore: 94,
    logoUrl: 'https://picsum.photos/seed/techflow/100/100'
  },
  {
    id: 'fb-2',
    title: 'Product Designer',
    company: 'Creative Pulse',
    location: 'Remote',
    salary: '₹12L - ₹18L LPA',
    type: 'Full-time',
    postedAt: '4 hours ago',
    description: 'Join our design team to craft beautiful and intuitive user experiences. You will collaborate closely with product managers and engineers.',
    tags: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
    matchScore: 89,
    logoUrl: 'https://picsum.photos/seed/creative/100/100'
  },
  {
    id: 'fb-3',
    title: 'Backend Developer (Node.js)',
    company: 'DataStream Corp',
    location: 'Gurugram, India',
    salary: '₹20L - ₹30L LPA',
    type: 'Full-time',
    postedAt: '1 day ago',
    description: 'Seeking a backend wizard to optimize our high-traffic APIs. Experience with Node.js, PostgreSQL, and Redis is required.',
    tags: ['Node.js', 'PostgreSQL', 'AWS', 'Microservices'],
    matchScore: 82,
    logoUrl: 'https://picsum.photos/seed/datastream/100/100'
  },
  {
    id: 'fb-4',
    title: 'Full Stack Developer',
    company: 'InnovateAI',
    location: 'Hyderabad, India',
    salary: '₹25L - ₹40L LPA',
    type: 'Full-time',
    postedAt: 'Just now',
    description: 'Work on cutting-edge AI integration projects. Requires proficiency in Python (Django/FastAPI) and React.',
    tags: ['Python', 'React', 'AI', 'Full Stack'],
    matchScore: 96,
    logoUrl: 'https://picsum.photos/seed/innovateai/100/100'
  },
  {
    id: 'fb-5',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Remote',
    salary: '₹15L - ₹22L LPA',
    type: 'Contract',
    postedAt: '3 days ago',
    description: 'Help us scale our infrastructure using Kubernetes and Terraform. Experience with CI/CD pipelines is a must.',
    tags: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
    matchScore: 78,
    logoUrl: 'https://picsum.photos/seed/cloudscale/100/100'
  },
  {
    id: 'fb-6',
    title: 'Mobile App Developer (Flutter)',
    company: 'Appify',
    location: 'Pune, India',
    salary: '₹10L - ₹16L LPA',
    type: 'Full-time',
    postedAt: '5 days ago',
    description: 'Build beautiful cross-platform mobile apps using Flutter. You will be responsible for the entire mobile lifecycle.',
    tags: ['Flutter', 'Dart', 'iOS', 'Android'],
    matchScore: 85,
    logoUrl: 'https://picsum.photos/seed/appify/100/100'
  },
  {
    id: 'fb-7',
    title: 'Marketing Manager',
    company: 'GrowthRocket',
    location: 'Mumbai, India',
    salary: '₹14L - ₹20L LPA',
    type: 'Full-time',
    postedAt: '1 week ago',
    description: 'Lead our growth initiatives and marketing campaigns. Experience in B2B SaaS is preferred.',
    tags: ['Marketing', 'SEO', 'Content Strategy', 'Growth Hacking'],
    matchScore: 75,
    logoUrl: 'https://picsum.photos/seed/growth/100/100'
  },
  {
    id: 'fb-8',
    title: 'Data Scientist',
    company: 'NeuralNet',
    location: 'Bangalore, India',
    salary: '₹30L - ₹45L LPA',
    type: 'Full-time',
    postedAt: '2 days ago',
    description: 'Analyze large datasets to derive actionable insights and build predictive models.',
    tags: ['Python', 'Machine Learning', 'SQL', 'Pandas'],
    matchScore: 92,
    logoUrl: 'https://picsum.photos/seed/neural/100/100'
  },
  {
    id: 'fb-9',
    title: 'UX Researcher',
    company: 'UserFirst',
    location: 'Remote',
    salary: '₹18L - ₹26L LPA',
    type: 'Contract',
    postedAt: '1 day ago',
    description: 'Conduct user research and usability testing to inform product decisions.',
    tags: ['User Research', 'Usability Testing', 'Figma', 'Psychology'],
    matchScore: 88,
    logoUrl: 'https://picsum.photos/seed/userfirst/100/100'
  },
  {
    id: 'fb-10',
    title: 'Go Developer',
    company: 'SystemCore',
    location: 'Remote',
    salary: '₹28L - ₹38L LPA',
    type: 'Freelance',
    postedAt: '3 hours ago',
    description: 'Build high-performance microservices in Go. Knowledge of gRPC and Protocol Buffers is essential.',
    tags: ['Go', 'Golang', 'Microservices', 'gRPC'],
    matchScore: 81,
    logoUrl: 'https://picsum.photos/seed/systemcore/100/100'
  }
];

const FALLBACK_CATEGORIES: JobCategory[] = [
    {
        title: "Top Matches for You",
        description: "Curated based on your profile (Offline Mode)",
        jobs: FALLBACK_JOBS.slice(0, 3).map(j => ({...j, id: 'fb-cat1-' + j.id}))
    },
     {
        title: "Popular in Tech",
        description: "Trending roles currently (Offline Mode)",
        jobs: FALLBACK_JOBS.slice(3, 6).map(j => ({...j, id: 'fb-cat2-' + j.id}))
    }
];

// Helper to filter fallback jobs locally to simulate search
const filterJobsLocally = (jobs: Job[], query: string, filters?: SearchFilters): Job[] => {
    let filtered = [...jobs];

    // 1. Text Search
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(q) ||
            job.company.toLowerCase().includes(q) ||
            job.description.toLowerCase().includes(q) ||
            job.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    // 2. Filters
    if (filters) {
        if (filters.remote) {
            filtered = filtered.filter(job => job.location.toLowerCase().includes('remote') || job.type.toLowerCase().includes('remote'));
        }
        
        if (filters.minSalary > 0) {
            filtered = filtered.filter(job => {
                const numbers = job.salary.match(/\d+/g);
                if (!numbers) return true;
                const maxValInLakhs = Math.max(...numbers.map(n => parseInt(n)));
                return (maxValInLakhs * 100000) >= filters.minSalary;
            });
        }

        if (filters.jobTypes.length > 0) {
            filtered = filtered.filter(job => filters.jobTypes.includes(job.type));
        }

        if (filters.prioritySkills && filters.prioritySkills.length > 0) {
             filtered.sort((a, b) => {
                const aHas = a.tags.some(t => filters.prioritySkills?.some(ps => t.toLowerCase().includes(ps.toLowerCase())));
                const bHas = b.tags.some(t => filters.prioritySkills?.some(ps => t.toLowerCase().includes(ps.toLowerCase())));
                return (aHas === bHas) ? 0 : aHas ? -1 : 1;
             });
        }

        if (filters.preferredCompanies && filters.preferredCompanies.length > 0) {
             filtered = filtered.filter(job => 
                 filters.preferredCompanies!.some(comp => 
                     job.company.toLowerCase().includes(comp.toLowerCase())
                 )
             );
        }
    }

    return filtered;
};

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string) => {
    try {
        // Try parsing directly
        return JSON.parse(text);
    } catch (e) {
        // Try finding code block
        const match = text.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (e2) {
                return [];
            }
        }
        // Try finding just array brackets
        const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
            try {
                return JSON.parse(arrayMatch[0]);
            } catch (e3) {
                return [];
            }
        }
        return [];
    }
};

export const searchJobsWithGemini = async (query: string, filters?: SearchFilters, userProfile?: UserProfile): Promise<Job[]> => {
  if (!apiKey) {
    console.warn("API Key missing, using fallback data.");
    const allFallback = FALLBACK_JOBS.map(j => ({...j, id: generateId()}));
    return filterJobsLocally(allFallback, query, filters);
  }

  try {
    const model = "gemini-3-flash-preview"; 
    
    // Construct a search query for Google
    let prompt = `You are a real-time job search engine.
    
    TASK: Use Google Search to find REAL, ACTIVE job listings for: "${query}".
    
    Search Parameters:
    - User Query: ${query}
    ${filters?.remote ? '- Remote Only: Yes' : ''}
    ${filters?.minSalary ? `- Minimum Salary: ₹${filters.minSalary / 100000} LPA` : ''}
    ${filters?.experienceLevel ? `- Experience Level: ${filters.experienceLevel}` : ''}
    ${filters?.prioritySkills ? `- Must utilize skills: ${filters.prioritySkills.join(', ')}` : ''}
    ${filters?.preferredCompanies && filters.preferredCompanies.length > 0 ? `- Preferred Companies: ${filters.preferredCompanies.join(', ')} (Prioritize these companies)` : ''}

    REQUIREMENTS:
    1. Perform a real Google Search to find current open positions from LinkedIn, Indeed, Glassdoor, Company Careers pages, or other reputable job boards in India (or global if remote).
    2. Extract the following details for 5-6 jobs:
       - Job Title
       - Company Name
       - Location
       - Salary (if mentioned, otherwise estimate based on market or put "Not disclosed")
       - Employment Type (Full-time/Contract)
       - Posted Date (e.g. "2 days ago")
       - Direct URL to apply (This is CRITICAL. Put the actual link found in search).
    3. Calculate a 'matchScore' (0-100) based on how well it fits the user's profile:
       - User Role: ${userProfile?.currentRole}
       - User Skills: ${userProfile?.skills.join(', ')}
       - User Bio: ${userProfile?.bio}
    
    OUTPUT FORMAT:
    Return ONLY a raw JSON array. Do not include markdown formatting or explanation. 
    The JSON structure must be:
    [
      {
        "title": "string",
        "company": "string",
        "location": "string",
        "salary": "string",
        "type": "string",
        "postedAt": "string",
        "description": "Short 2 sentence summary",
        "tags": ["string", "string"],
        "matchScore": number,
        "applyUrl": "string (URL found in search)"
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Real Internet Access
        // Note: We cannot use responseSchema strictly with googleSearch in all cases as it might block the tool output. 
        // We rely on the prompt to enforce JSON structure.
      },
    });

    const text = response.text || "[]";
    const jobsRaw = extractJson(text);
    
    if (!Array.isArray(jobsRaw) || jobsRaw.length === 0) {
        // Fallback if search returns nothing useful or parse fails
        console.warn("Search returned no valid JSON, using fallback.");
        const allFallback = FALLBACK_JOBS.map(j => ({...j, id: generateId()}));
        return filterJobsLocally(allFallback, query, filters);
    }

    // Enrich with IDs and Placeholders
    return jobsRaw.map((job: any, index: number) => ({
      ...job,
      id: generateId(),
      // Ensure we have a valid URL or fallback
      logoUrl: `https://picsum.photos/seed/${(job.company || 'comp').replace(/\s/g, '')}${index}/100/100`,
      tags: job.tags || ['Hiring'],
      matchScore: job.matchScore || 80
    }));

  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
        console.warn("Gemini API Quota Exceeded. Switching to offline demo mode.");
    } else {
        console.error("Gemini Search Error:", error);
    }
    const allFallback = FALLBACK_JOBS.map(j => ({...j, id: generateId()}));
    return filterJobsLocally(allFallback, query, filters);
  }
};

export const getDiscoveryFeed = async (userProfile?: UserProfile): Promise<JobCategory[]> => {
  if (!apiKey) return FALLBACK_CATEGORIES;

  try {
    const model = "gemini-3-flash-preview";

    // For discovery, we can also use search to get trending real data
    let prompt = `Find 3 trending job categories in the Indian Tech market right now using Google Search.
    For each category, find 3 REAL active job listings.
    
    User Profile Context: ${userProfile?.currentRole}, Skills: ${userProfile?.skills.join(', ')}.

    Return JSON array of Categories:
    [
      {
        "title": "Category Name",
        "description": "Why it's trending",
        "jobs": [ ... same job structure as search including applyUrl ... ]
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "[]";
    const categoriesRaw = extractJson(text);
    
    if (!Array.isArray(categoriesRaw) || categoriesRaw.length === 0) {
        return FALLBACK_CATEGORIES;
    }
    
    return categoriesRaw.map((cat: any) => ({
      ...cat,
      jobs: (cat.jobs || []).map((job: any, index: number) => ({
        ...job,
        id: generateId(),
        matchScore: job.matchScore || Math.floor(Math.random() * (99 - 85) + 85),
        logoUrl: `https://picsum.photos/seed/${(job.company || 'c').replace(/\s/g, '')}${index}/100/100`,
        tags: job.tags || ['Trending']
      }))
    }));

  } catch (error: any) {
    console.warn("Discovery API error/quota, using fallback.");
    return FALLBACK_CATEGORIES;
  }
};

export const generateJobDetails = async (job: Job): Promise<string> => {
   const buildFallbackDetails = () => {
       return `## Job Details\n\n**Source:** ${job.applyUrl ? 'Found via Google Search' : 'TheGigFinder Network'}\n\n### About the Role\n${job.description}\n\n### Key Responsibilities\n- Design, develop, and maintain high-quality software solutions.\n- Collaborate with cross-functional teams.\n\n${job.applyUrl ? `[Click here to view full details on company site](${job.applyUrl})` : ''}`;
   };

   if (!apiKey) return buildFallbackDetails();
   
   try {
     const model = "gemini-3-flash-preview";
     const response = await ai.models.generateContent({
       model,
       contents: `Write a detailed job description for ${job.title} at ${job.company}. 
       If you have specific knowledge about this company, use it. 
       Otherwise generate a standard professional description based on the title and tags: ${job.tags.join(', ')}.
       Include a section at the end encouraging the user to apply via the official link provided.`,
     });
     return response.text || buildFallbackDetails();
   } catch (e) {
     return buildFallbackDetails();
   }
}
import { GoogleGenAI, Type } from "@google/genai";
import { Job, JobCategory, SearchFilters, UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const searchJobsWithGemini = async (query: string, filters?: SearchFilters, userProfile?: UserProfile): Promise<Job[]> => {
  if (!apiKey) {
    console.error("API Key missing");
    return [];
  }

  try {
    const model = "gemini-3-flash-preview"; // Fast model for search results
    
    let prompt = `Generate 6 realistic job postings for the Indian market (or global remote) based on this search query: "${query}".`;

    // Apply Filters
    if (filters?.remote) prompt += ` The jobs MUST be fully Remote positions.`;
    if (filters?.minSalary && filters.minSalary > 0) prompt += ` Ensure the salary range starts at or above ₹${filters.minSalary / 100000} Lakhs per annum (LPA).`;
    if (filters?.jobTypes && filters.jobTypes.length > 0) prompt += ` The job types should be one of: ${filters.jobTypes.join(', ')}.`;
    if (filters?.experienceLevel) prompt += ` The experience level required should be ${filters.experienceLevel}.`;

    // Apply User Profile Personalization
    if (userProfile) {
      prompt += `
        CONTEXT - USER PROFILE:
        Role: ${userProfile.currentRole} (${userProfile.yearsExperience} years exp).
        Skills: ${userProfile.skills.join(', ')}.
        Bio: ${userProfile.bio}.
        Locations: ${userProfile.preferences.locations.join(', ')}.
        
        WEIGHTING INSTRUCTIONS:
        1. **SKILL MATCH (Critical)**: Prioritize jobs that specifically require ${userProfile.skills.slice(0, 3).join(', ')}.
        2. **EXPERIENCE FIT**: Avoid roles that are too junior or too senior for someone with ${userProfile.yearsExperience} years experience.
        3. **LOCATION**: Boost score for jobs in ${userProfile.preferences.locations.join(', ')}.
        
        CALCULATE 'matchScore' (0-99):
        - 90-99: Perfect match for Skills AND Location AND Experience.
        - 80-89: Good match for Skills, acceptable Location.
        - <75: Loose match.
      `;

      if (userProfile.dislikedJobs && userProfile.dislikedJobs.length > 0) {
        const disliked = userProfile.dislikedJobs.slice(-5).map(j => `"${j.title}" at ${j.company}`).join(', ');
        prompt += `
        NEGATIVE CONSTRAINTS:
        The user has marked these jobs as "Not Interested": ${disliked}.
        - Do NOT generate these specific jobs again.
        - Avoid similar companies or role types if they seem irrelevant to the user's core skills.
        `;
      }
    }

    prompt += ` If the query is empty or generic, generate diverse tech and creative roles in major Indian tech hubs (Bangalore, Hyderabad, Pune, Gurugram).
      Make them sound exciting and modern. Convert all salaries to Indian Rupees (₹) per annum (LPA) or per month.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING, description: "e.g. ₹12L - ₹15L LPA" },
              type: { type: Type.STRING, description: "Full-time, Contract, Remote" },
              postedAt: { type: Type.STRING, description: "e.g. 2d ago" },
              description: { type: Type.STRING, description: "2-3 sentence summary" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchScore: { type: Type.INTEGER, description: "A number between 70 and 99 indicating relevance" }
            },
            required: ["title", "company", "location", "salary", "type", "description", "tags"],
          },
        },
      },
    });

    const jobsRaw = JSON.parse(response.text || "[]");
    
    // Enrich with IDs and Placeholders
    return jobsRaw.map((job: any, index: number) => ({
      ...job,
      id: generateId(),
      logoUrl: `https://picsum.photos/seed/${job.company.replace(/\s/g, '')}${index}/100/100`
    }));

  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const getDiscoveryFeed = async (userProfile?: UserProfile): Promise<JobCategory[]> => {
  if (!apiKey) return [];

  try {
    const model = "gemini-3-flash-preview";

    let prompt = `Generate 3 distinct, trending job categories for a modern job board in India.`;

    if (userProfile && userProfile.skills.length > 0) {
      prompt = `
        The user is a ${userProfile.currentRole} with skills: ${userProfile.skills.join(', ')}.
        Generate 3 distinct job categories specifically tailored to advance this user's career in the Indian tech ecosystem.
        1. A "Best Match" category (Highly relevant).
        2. A "High Growth" category (Emerging tech in India).
        3. A "Trending in India" category (Popular roles in Bangalore/Gurugram).
      `;

      if (userProfile.dislikedJobs && userProfile.dislikedJobs.length > 0) {
        const disliked = userProfile.dislikedJobs.slice(-3).map(j => j.title).join(', ');
        prompt += ` Avoid recommending roles similar to: ${disliked}.`;
      }
    } else {
      prompt += ` e.g., "AI & ML in Bangalore", "Remote Startups", "FinTech in Mumbai".`;
    }

    prompt += ` For each category, provide a title, a short description explaining why it fits, and 3-4 realistic job listings with salaries in ₹ (LPA).`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              jobs: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    salary: { type: Type.STRING },
                    type: { type: Type.STRING },
                    postedAt: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                   }
                }
              }
            }
          }
        }
      }
    });

    const categoriesRaw = JSON.parse(response.text || "[]");
    
    return categoriesRaw.map((cat: any) => ({
      ...cat,
      jobs: cat.jobs.map((job: any, index: number) => ({
        ...job,
        id: generateId(),
        matchScore: Math.floor(Math.random() * (99 - 85) + 85),
        logoUrl: `https://picsum.photos/seed/${job.company.replace(/\s/g, '')}${index}/100/100`
      }))
    }));

  } catch (error) {
    console.error("Discovery failed:", error);
    return [];
  }
};

export const generateJobDetails = async (job: Job): Promise<string> => {
   if (!apiKey) return "Detailed description unavailable.";
   
   try {
     const model = "gemini-3-flash-preview";
     const response = await ai.models.generateContent({
       model,
       contents: `Write a detailed, engaging job description (markdown format) for a ${job.title} role at ${job.company} located in ${job.location}. 
       Include "Key Responsibilities", "Requirements" (tailored to Indian market standards), and "Perks & Benefits". 
       Keep it professional but exciting. The summary provided was: ${job.description}.`,
     });
     return response.text || "Details unavailable.";
   } catch (e) {
     return "Failed to load details.";
   }
}
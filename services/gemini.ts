import { GoogleGenAI } from "@google/genai";
import { Job, JobCategory, SearchFilters, UserProfile } from "../types";
import { searchJobsLocal, getTrendingCategoriesLocal } from "./searchEngine";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- RAG IMPLEMENTATION ---
// 1. Retrieval: Done locally via searchEngine.ts (Fast, ~10ms)
// 2. Augmentation: Done here via Gemini (Slow, ~1-2s) only when necessary

export const searchJobsWithGemini = async (query: string, filters?: SearchFilters, userProfile?: UserProfile): Promise<Job[]> => {
  // FAST PATH: Local Semantic Search
  // We utilize the local database of 1000+ jobs instead of asking Gemini to "imagine" jobs.
  console.time("LocalSearch");
  const localResults = searchJobsLocal(query, filters, userProfile);
  console.timeEnd("LocalSearch");
  
  // If we found good results locally, return them immediately.
  // This provides the "Instant" feel.
  if (localResults.length > 0) {
      return localResults;
  }

  // FALLBACK / AUGMENTATION:
  // Only if local search fails completely (rare with 1000 jobs), we might consider API
  // but for this performance-focused refactor, we stick to local.
  return []; 
};

export const getDiscoveryFeed = async (userProfile?: UserProfile): Promise<JobCategory[]> => {
  // Use local aggregation for instant feed
  return getTrendingCategoriesLocal(userProfile);
};

export const generateJobDetails = async (job: Job): Promise<string> => {
   // This is the "Generative" part of RAG. 
   // We retrieve the ID/Basic info locally, but Generate the full rich text description using AI.
   
   const buildFallbackDetails = () => {
       return `## Job Details\n\n**Source:** ${job.applyUrl ? 'Direct Apply' : 'TheGigFinder Database'}\n\n### About the Role\n${job.description}\n\n### Key Responsibilities\n- Drive innovation in the ${job.tags[0]} space.\n- Collaborate with cross-functional teams at ${job.company}.\n- Utilize skills like ${job.tags.slice(1).join(', ')} to deliver high-quality work.\n\n### Benefits\n- Competitive Salary: ${job.salary}\n- Flexible remote work policy.\n- Health insurance and wellness benefits.\n\n${job.applyUrl ? `[Click here to apply on company site](${job.applyUrl})` : ''}`;
   };

   if (!apiKey) return buildFallbackDetails();
   
   try {
     const model = "gemini-3-flash-preview";
     const response = await ai.models.generateContent({
       model,
       contents: `You are a professional HR recruiter. Write a compelling, structured job description for the role of "${job.title}" at "${job.company}".
       
       Context:
       - Location: ${job.location}
       - Salary: ${job.salary}
       - Key Skills: ${job.tags.join(', ')}
       - Short Summary: ${job.description}
       
       Format using Markdown (H2, H3, bullet points). Make it sound exciting and professional.
       Include a "Why Join Us" section.
       `,
     });
     return response.text || buildFallbackDetails();
   } catch (e) {
     return buildFallbackDetails();
   }
}
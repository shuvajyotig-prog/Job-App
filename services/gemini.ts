import { GoogleGenAI, Type } from "@google/genai";
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

export const parseResumeText = async (text: string): Promise<Partial<UserProfile>> => {
  if (!apiKey) return {};

  try {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: `Extract the following details from this resume text into a JSON object:
      - name (string)
      - currentRole (string, infer if not explicit)
      - bio (short professional summary, max 200 chars)
      - skills (array of strings)
      - yearsExperience (number, estimate based on work history)
      - education (string, most recent degree/university)
      - experienceSummary (string, a concise paragraph summarizing work history)
      
      Resume Text:
      ${text.slice(0, 10000)} // Limit context window just in case
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             name: { type: Type.STRING },
             currentRole: { type: Type.STRING },
             bio: { type: Type.STRING },
             skills: { type: Type.ARRAY, items: { type: Type.STRING } },
             yearsExperience: { type: Type.NUMBER },
             education: { type: Type.STRING },
             experienceSummary: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse resume with Gemini", e);
    return {};
  }
};

export const parseResumeFile = async (base64: string, mimeType: string): Promise<Partial<UserProfile>> => {
  if (!apiKey) return {};

  try {
    const model = "gemini-3-flash-preview"; 
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64
                }
            },
            {
                text: `Extract the following details from this resume file into a JSON object:
                  - name (string)
                  - currentRole (string, infer if not explicit)
                  - bio (short professional summary, max 200 chars)
                  - skills (array of strings)
                  - yearsExperience (number, estimate based on work history)
                  - education (string, most recent degree/university)
                  - experienceSummary (string, a concise paragraph summarizing work history)
                  
                  If the document is not a resume, try to extract whatever professional info is available.
                `
            }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             name: { type: Type.STRING },
             currentRole: { type: Type.STRING },
             bio: { type: Type.STRING },
             skills: { type: Type.ARRAY, items: { type: Type.STRING } },
             yearsExperience: { type: Type.NUMBER },
             education: { type: Type.STRING },
             experienceSummary: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse resume file with Gemini", e);
    return {};
  }
};

export const createCoachChat = (userProfile: UserProfile) => {
    // Construct system instruction based on profile
    const instruction = `You are "GigCoach", a friendly, encouraging, and expert career coach.
    
    You are chatting with ${userProfile.name}.
    Their current role: ${userProfile.currentRole}.
    Skills: ${userProfile.skills.join(', ')}.
    Years Experience: ${userProfile.yearsExperience}.
    Bio: ${userProfile.bio}.
    Preferences: ${userProfile.preferences.remote ? 'Remote' : 'On-site'}, Min Salary ${userProfile.preferences.minSalary}.

    Your goal is to help them with job search strategies, resume improvements, interview preparation, and career advice.
    Keep your responses conversational, concise (under 200 words unless asked for more), and formatted like a chat message (use emojis sparingly, bullet points for lists).
    Do not be overly formal. Be like a smart mentor on WhatsApp.
    `;

    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: instruction,
        }
    });
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
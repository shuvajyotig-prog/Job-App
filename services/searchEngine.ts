import { Job, SearchFilters, UserProfile } from '../types';
import { MOCK_DATABASE, LOCATIONS } from './jobDatabase';

// Calculate how well a job matches the user's query and profile
// This mimics "Vector Search" by using weighted keyword density and profile alignment
const calculateScore = (job: Job, query: string, filters: SearchFilters | undefined, profile?: UserProfile): number => {
    let score = 0;
    const q = query.toLowerCase().trim();
    const jobTitle = job.title.toLowerCase();
    const jobDesc = job.description.toLowerCase();
    const jobCompany = job.company.toLowerCase();
    const jobLocation = job.location.toLowerCase();
    const jobTags = job.tags.map(t => t.toLowerCase());
    
    // 1. Text Relevance (The "Semantic" simulation)
    if (q) {
        const queryWords = q.split(/\s+/); // Split by whitespace
        
        // Detect Location Intent explicitly
        let locationIntent = '';
        for (const word of queryWords) {
             const foundLoc = LOCATIONS.find(l => l.toLowerCase() === word || l.toLowerCase().includes(word) && word.length > 3);
             if (foundLoc) {
                 locationIntent = foundLoc.toLowerCase();
                 break;
             }
        }

        // Apply Location Scoring Strategy
        if (locationIntent) {
            if (jobLocation.includes(locationIntent)) {
                score += 500; // Massive boost for location match
            } else if (!jobLocation.includes('remote')) {
                // If job is not in the desired location and not remote, punish it severely
                score -= 500;
            }
        }

        // Exact title match gets huge boost
        if (jobTitle === q) score += 100;
        else if (jobTitle.includes(q)) score += 50;
        
        // Company match
        if (jobCompany.includes(q)) score += 40;

        // Tag match
        if (jobTags.some(t => t.includes(q))) score += 30;

        // Description keyword match (Semantic intent)
        // If user types "React", finding it in description adds points
        queryWords.forEach(word => {
            // Skip location words in keyword scoring if we already handled them
            if (locationIntent && word.includes(locationIntent)) return;

            if (jobTitle.includes(word)) score += 15;
            if (jobDesc.includes(word)) score += 5;
            if (jobTags.some(t => t === word)) score += 15;
            if (jobCompany.includes(word)) score += 10;
        });
    } else {
        // If no query, base score on freshness or randomization to show "Feed"
        score += 10;
    }

    // 2. Filter Constraints (Hard Filters)
    if (filters) {
        // Remote
        if (filters.remote) {
            if (!job.location.toLowerCase().includes('remote')) return -1; // Hard fail
        }
        
        // Salary
        if (filters.minSalary > 0) {
            // Extract max salary from string "₹12L - ₹18L" -> 18
            const numbers = job.salary.match(/\d+/g);
            if (!numbers) return -1;
            const maxLPA = Math.max(...numbers.map(n => parseInt(n)));
            if ((maxLPA * 100000) < filters.minSalary) return -1;
        }

        // Job Type
        if (filters.jobTypes.length > 0) {
            if (!filters.jobTypes.some(t => job.type.toLowerCase() === t.toLowerCase())) return -1;
        }

        // Experience Level (Heuristic based on title keywords)
        if (filters.experienceLevel) {
            const level = filters.experienceLevel.toLowerCase();
            const title = jobTitle;
            if (level.includes('senior') && !title.includes('senior') && !title.includes('lead') && !title.includes('manager')) return -1;
            if (level.includes('entry') && (title.includes('senior') || title.includes('lead'))) return -1;
        }

        // Priority Skills (Soft Filter - Boost Score)
        if (filters.prioritySkills && filters.prioritySkills.length > 0) {
            const hasSkill = job.tags.some(tag => 
                filters.prioritySkills?.some(skill => tag.toLowerCase().includes(skill.toLowerCase()))
            );
            if (hasSkill) score += 25;
            else if (filters.prioritySkills.length > 0) score -= 10; // Penalize if missing priority skills
        }

        // Preferred Companies
        if (filters.preferredCompanies && filters.preferredCompanies.length > 0) {
             const isPreferred = filters.preferredCompanies.some(c => jobCompany.includes(c.toLowerCase()));
             if (isPreferred) score += 50;
        }
    }

    // 3. Personalization (Profile RAG)
    if (profile) {
        // Role match
        const profileRoleParts = profile.currentRole.toLowerCase().split(' ');
        if (profileRoleParts.some(p => jobTitle.includes(p))) score += 15;

        // Skill overlap
        const matchingSkills = job.tags.filter(tag => 
            profile.skills.some(s => s.toLowerCase() === tag.toLowerCase())
        );
        score += (matchingSkills.length * 5);

        // Disliked
        if (profile.dislikedJobs?.some(d => d.company === job.company && d.title === job.title)) {
            return -1;
        }
    }

    return score;
};

export const searchJobsLocal = (query: string, filters?: SearchFilters, profile?: UserProfile): Job[] => {
    // 1. Score all jobs
    const scoredJobs = MOCK_DATABASE.map(job => {
        const score = calculateScore(job, query, filters, profile);
        // Normalize score to 0-100 for UI display
        // Ensure that a hard negative score remains negative so it is filtered out
        const matchPct = score > 0 ? Math.min(99, Math.max(60, Math.round(50 + (score / 20)))) : 0; 
        return { ...job, matchScore: matchPct, _rawScore: score };
    });

    // 2. Filter out bad matches (score <= 0 means hard filter fail or terrible match)
    // and sort by score descending
    const results = scoredJobs
        .filter(j => j._rawScore > 0)
        .sort((a, b) => b._rawScore - a._rawScore);

    // 3. Return top 50 to keep DOM light
    return results.slice(0, 50);
};

export const getTrendingCategoriesLocal = (profile?: UserProfile) => {
    const categories = [
        { id: 'Frontend', title: 'Frontend Development', desc: 'Building beautiful interfaces' },
        { id: 'Backend', title: 'Backend Systems', desc: 'Scalable infrastructure roles' },
        { id: 'Product', title: 'Product Management', desc: 'Leading product vision' }
    ];

    return categories.map(cat => ({
        title: cat.title,
        description: cat.desc,
        jobs: searchJobsLocal(cat.id, undefined, profile).slice(0, 4)
    }));
};
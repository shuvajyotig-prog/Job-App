import React, { useEffect, useState } from 'react';
import { JobCategory, Job, UserProfile } from '../types';
import { getDiscoveryFeed } from '../services/gemini';
import { JobCard } from './JobCard';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';

interface DiscoveryTabProps {
  onJobClick: (job: Job) => void;
  userProfile?: UserProfile;
  onDislike?: (job: Job) => void;
}

export const DiscoveryTab: React.FC<DiscoveryTabProps> = ({ onJobClick, userProfile, onDislike }) => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscovery = async () => {
      setLoading(true);
      const data = await getDiscoveryFeed(userProfile);
      setCategories(data);
      setLoading(false);
    };
    fetchDiscovery();
  }, [userProfile]); // Reload when profile changes

  const handleDislikeLocal = (jobToDislike: Job) => {
    // Remove immediately from UI
    setCategories(prevCats => prevCats.map(cat => ({
      ...cat,
      jobs: cat.jobs.filter(j => j.id !== jobToDislike.id)
    })));
    // Propagate
    if (onDislike) onDislike(jobToDislike);
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
          <p>Curating jobs for you...</p>
       </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
       {/* Hero / Welcome */}
       <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 mb-12 text-white shadow-xl shadow-blue-200">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-4 border border-white/20">
               <Sparkles size={16} /> 
               <span>AI-Powered Discovery</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              {userProfile?.name ? `Welcome back, ${userProfile.name.split(' ')[0]}` : 'Discover your potential'}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
               {userProfile?.skills.length 
                ? "We've curated roles based on your skills and experience." 
                : "We've analyzed market trends to bring you top opportunities in high-growth sectors."}
            </p>
          </div>
       </div>

       {/* Categories */}
       <div className="space-y-16">
          {categories.map((cat, idx) => (
             <section key={idx}>
                <div className="flex items-center gap-3 mb-6 px-2">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <TrendingUp size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900">{cat.title}</h2>
                      <p className="text-slate-500">{cat.description}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {cat.jobs.map((job) => (
                      <div key={job.id} className="h-full">
                         <JobCard job={job} onClick={onJobClick} onDislike={handleDislikeLocal} featured={idx === 0} />
                      </div>
                   ))}
                </div>
             </section>
          ))}
       </div>
    </div>
  );
};
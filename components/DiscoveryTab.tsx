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
       <div className="flex flex-col items-center justify-center h-[60vh] text-neo-black">
          <Loader2 className="animate-spin mb-4 text-electric" size={48} strokeWidth={3} />
          <p className="font-bold text-lg font-display">Curating the vibe...</p>
       </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
       {/* Hero / Welcome - Neo Brutalist Mesh */}
       <div className="bg-[#ccff00] rounded-[2.5rem] p-10 md:p-14 mb-16 border-2 border-neo-black shadow-neo relative overflow-hidden">
          {/* Abstract blob decoration */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-hot-pink rounded-full blur-[80px] opacity-40 mix-blend-multiply pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-electric rounded-full blur-[80px] opacity-30 mix-blend-multiply pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-neo-black text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm border-2 border-transparent">
               <Sparkles size={16} className="text-acid" /> 
               <span>AI-POWERED DISCOVERY</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-neo-black font-display leading-[0.9]">
              {userProfile?.name ? `Ready to level up, ${userProfile.name.split(' ')[0]}?` : 'Discover your potential'}
            </h1>
            <p className="text-neo-black text-xl font-medium leading-relaxed max-w-lg">
               {userProfile?.skills.length 
                ? "We've curated roles based on your skills and experience. Secure the bag." 
                : "We've analyzed market trends to bring you top opportunities in high-growth sectors."}
            </p>
          </div>
       </div>

       {/* Categories */}
       <div className="space-y-20">
          {categories.map((cat, idx) => (
             <section key={idx}>
                <div className="flex items-center gap-4 mb-8 px-2">
                   <div className="p-3 bg-white text-neo-black rounded-xl border-2 border-neo-black shadow-[4px_4px_0px_black] transform -rotate-2">
                      <TrendingUp size={28} strokeWidth={3} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-neo-black font-display tracking-tight">{cat.title}</h2>
                      <p className="text-slate-600 font-medium text-lg">{cat.description}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
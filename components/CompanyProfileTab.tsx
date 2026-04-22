import React, { useMemo } from 'react';
import { Job, UserProfile } from '../types';
import { MOCK_DATABASE } from '../services/jobDatabase';
import { JobCard } from './JobCard';
import { Building2, MapPin, Users, Star, ArrowLeft, ExternalLink, Briefcase } from 'lucide-react';

interface CompanyProfileTabProps {
  companyName: string;
  onJobClick: (job: Job) => void;
  onDislike: (job: Job) => void;
  onBack: () => void;
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({ companyName, onJobClick, onDislike, onBack }) => {
  // Fetch jobs for this company
  const companyJobs = useMemo(() => {
    return MOCK_DATABASE.filter(job => job.company === companyName);
  }, [companyName]);

  // Derived mock data based on company name
  const companyLogo = `https://picsum.photos/seed/${companyName.replace(/\s/g, '')}Company/200/200`;
  const employeeCount = (companyName.length * 150) + 120; // Fake deterministic count
  const rating = (Math.max(3.8, 5 - (companyName.length * 0.1))).toFixed(1); // Fake rating between 3.8 and 5.0
  const isStartup = companyJobs.length < 10;
  
  // Fake reviews
  const mockReviews = [
    { id: 1, role: "Software Engineer", rating: parseInt(rating), comment: "Great engineering culture and work-life balance. Highly recommend for people who want to learn fast." },
    { id: 2, role: "Product Manager", rating: Math.max(1, parseInt(rating) - 1), comment: "Fast-paced environment. Sometimes priorities shift quickly, but you get to work on impactful features." },
    { id: 3, role: "UX Designer", rating: 5, comment: "Amazing team and great perks! The design org really values user research." }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-neo-black font-bold mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl border-2 border-neo-black shadow-neo overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-neo-black overflow-hidden shadow-neo-sm z-10">
              <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-display font-black text-neo-black">{companyName}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-slate-600">
                <span className="flex items-center gap-1"><Building2 size={16} /> {isStartup ? 'Startup' : 'Enterprise'}</span>
                <span className="flex items-center gap-1"><Users size={16} /> {employeeCount.toLocaleString()}+ Employees</span>
                <span className="flex items-center gap-1 text-yellow-600"><Star size={16} fill="currentColor" /> {rating} / 5.0</span>
              </div>
            </div>
            
            <button className="bg-neo-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:-translate-y-1 hover:shadow-neo transition-all mt-4 md:mt-0 whitespace-nowrap border-2 border-transparent">
              <ExternalLink size={18} /> View Website
            </button>
          </div>

          <div className="prose prose-slate max-w-none font-medium">
            <p>
              {companyName} is leading the way in building innovative solutions for tomorrow. 
              We are a remote-friendly organization that prides itself on fostering talent, encouraging 
              out-of-the-box thinking, and delivering exceptional value. Check out our open roles below 
              and see if you're a fit for our growing team.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open Roles (Takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-black text-neo-black flex items-center gap-2">
            <Briefcase className="text-electric" size={24} /> 
            Open Roles ({companyJobs.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyJobs.length > 0 ? (
              companyJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={onJobClick} 
                  onDislike={onDislike}
                  featured={job.tags.includes('Senior')}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                 <p className="text-slate-500 font-medium">No open roles currently listed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews (Takes 1/3 width on large screens) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-black text-neo-black flex items-center gap-2">
            <Star className="text-acid" size={24} fill="currentColor" /> 
            Life at {companyName}
          </h2>

          <div className="space-y-4">
             {mockReviews.map(review => (
               <div key={review.id} className="bg-white p-5 rounded-2xl border-2 border-neo-black shadow-neo-sm">
                  <div className="flex items-center justify-between mb-2">
                     <span className="font-bold text-sm text-neo-black">{review.role}</span>
                     <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-300" : ""} />
                        ))}
                     </div>
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed text-balance">
                    "{review.comment}"
                  </p>
               </div>
             ))}
          </div>

          <div className="bg-acid/20 border-2 border-neo-black rounded-2xl p-6 text-center shadow-neo-sm">
            <p className="font-bold text-neo-black mb-3 text-lg">Work Here?</p>
            <button className="w-full bg-white border-2 border-neo-black py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-neo-sm hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5">
               Leave a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Job } from '../types';
import { Badge } from './ui/Badge';
import { MapPin, IndianRupee, Clock, Building2, Sparkles, ThumbsDown, ArrowUpRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  onDislike?: (job: Job) => void;
  featured?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, onDislike, featured = false }) => {
  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDislike) onDislike(job);
  };

  return (
    <div 
      onClick={() => onClick(job)}
      className={`
        group relative bg-white rounded-2xl p-6 cursor-pointer 
        border-2 border-neo-black 
        transition-all duration-200 ease-in-out
        hover:shadow-neo hover:-translate-y-1 hover:-translate-x-1
        ${featured ? 'bg-gradient-to-br from-white to-purple-50' : ''}
      `}
    >
      {/* Match Score Badge (AI Feature) */}
      {job.matchScore && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
           <div className="flex items-center gap-1 bg-acid text-neo-black text-xs font-black px-3 py-1.5 rounded-lg border-2 border-neo-black shadow-sm rotate-2 group-hover:rotate-0 transition-transform">
              <Sparkles size={14} fill="black" />
              <span>{job.matchScore}% MATCH</span>
           </div>
        </div>
      )}
      
      {/* Dislike Action */}
      {onDislike && (
         <button 
            onClick={handleDislike}
            className="absolute top-4 right-4 z-0 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Not for me"
         >
            <ThumbsDown size={18} strokeWidth={2.5} />
         </button>
      )}

      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-xl bg-white overflow-hidden flex-shrink-0 border-2 border-neo-black flex items-center justify-center shadow-sm">
          {job.logoUrl ? (
            <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="text-neo-black" size={28} />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex justify-between items-start pr-8">
             <h3 className="text-xl font-display font-bold text-neo-black group-hover:text-electric transition-colors truncate leading-tight">
               {job.title}
             </h3>
          </div>
          
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-600 mt-1 mb-4">
            <span className="flex items-center text-neo-black">
               <Building2 size={16} className="mr-1.5" />
               {job.company}
            </span>
            <span className="flex items-center">
               <MapPin size={16} className="mr-1.5" />
               {job.location}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
             {job.tags.slice(0, 3).map(tag => (
               <Badge key={tag} variant="secondary">{tag}</Badge>
             ))}
          </div>

          <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3 mt-2">
             <div className="flex items-center gap-4 text-sm font-bold">
                <span className="flex items-center bg-green-100 px-2 py-0.5 rounded-md border border-green-200 text-green-800">
                  <IndianRupee size={14} className="mr-0.5" />
                  {job.salary}
                </span>
                <span className="flex items-center text-slate-400 font-medium text-xs">
                  <Clock size={14} className="mr-1" />
                  {job.postedAt}
                </span>
             </div>
             <div className="w-8 h-8 rounded-full border-2 border-neo-black flex items-center justify-center bg-neo-black text-white group-hover:bg-acid group-hover:text-neo-black transition-colors">
                <ArrowUpRight size={18} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
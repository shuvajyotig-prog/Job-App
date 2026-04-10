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
        group relative bg-white rounded-2xl p-4 cursor-pointer 
        border-2 border-neo-black 
        transition-all duration-200 ease-in-out
        hover:shadow-neo hover:-translate-y-1 hover:-translate-x-1
        ${featured ? 'bg-gradient-to-br from-white to-purple-50' : ''}
      `}
    >
      {/* Match Score Badge (AI Feature) */}
      {job.matchScore && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2 z-10">
           <div className="flex items-center gap-1 bg-acid text-neo-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-neo-black shadow-sm">
              <Sparkles size={12} fill="black" />
              <span>{job.matchScore}% MATCH</span>
           </div>
        </div>
      )}
      
      {/* Dislike Action */}
      {onDislike && (
         <button 
            onClick={handleDislike}
            className="absolute top-3 right-2 z-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title="Not for me"
         >
            <ThumbsDown size={16} strokeWidth={2.5} />
         </button>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border-2 border-neo-black flex items-center justify-center shadow-sm">
          {job.logoUrl ? (
            <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="text-neo-black" size={20} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start pr-6">
             <h3 className="text-lg font-display font-bold text-neo-black group-hover:text-electric transition-colors truncate leading-tight">
               {job.title}
             </h3>
          </div>
          
          <div className="flex flex-col gap-0.5 text-xs font-medium text-slate-600 mt-1 mb-3">
            <span className="flex items-center text-neo-black truncate">
               <Building2 size={12} className="mr-1" />
               {job.company}
            </span>
            <span className="flex items-center truncate">
               <MapPin size={12} className="mr-1" />
               {job.location}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
             {job.tags.slice(0, 2).map(tag => (
               <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">{tag}</Badge>
             ))}
             {job.tags.length > 2 && (
               <span className="text-[10px] text-slate-400 font-bold self-center">+{job.tags.length - 2}</span>
             )}
          </div>

          <div className="flex items-center justify-between border-t-2 border-slate-100 pt-2 mt-1">
             <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex items-center bg-green-100 px-1.5 py-0.5 rounded border border-green-200 text-green-800 whitespace-nowrap">
                  <IndianRupee size={10} className="mr-0.5" />
                  {job.salary}
                </span>
                <span className="flex items-center text-slate-400 font-medium text-[10px] whitespace-nowrap">
                  <Clock size={10} className="mr-1" />
                  {job.postedAt}
                </span>
             </div>
             <div className="w-6 h-6 rounded-full border-2 border-neo-black flex items-center justify-center bg-neo-black text-white group-hover:bg-acid group-hover:text-neo-black transition-colors">
                <ArrowUpRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
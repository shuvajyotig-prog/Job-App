import React from 'react';
import { Job } from '../types';
import { Badge } from './ui/Badge';
import { MapPin, IndianRupee, Clock, Building2, Sparkles, ThumbsDown } from 'lucide-react';

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
        group relative bg-white rounded-xl p-5 cursor-pointer 
        border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300
        transition-all duration-200 ease-in-out
        ${featured ? 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100' : ''}
      `}
    >
      {/* Match Score Badge (AI Feature) */}
      {job.matchScore && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
            {onDislike && (
              <button 
                onClick={handleDislike}
                className="p-1.5 rounded-full text-slate-300 hover:bg-slate-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Not Interested"
              >
                <ThumbsDown size={14} />
              </button>
            )}
            <div className="flex items-center space-x-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg border border-green-100">
              <Sparkles size={12} />
              <span>{job.matchScore}% Match</span>
            </div>
        </div>
      )}
      
      {/* Fallback dislike button position if matchScore is missing */}
      {!job.matchScore && onDislike && (
         <button 
            onClick={handleDislike}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:bg-slate-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Not Interested"
         >
            <ThumbsDown size={16} />
         </button>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
          <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-20">
            {job.title}
          </h3>
          <div className="flex items-center text-slate-500 text-sm mt-1 mb-3">
            <Building2 size={14} className="mr-1" />
            <span className="font-medium mr-3">{job.company}</span>
            <MapPin size={14} className="mr-1" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
             {job.tags.slice(0, 3).map(tag => (
               <Badge key={tag} variant="secondary">{tag}</Badge>
             ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3 mt-1">
             <div className="flex items-center gap-3">
                <span className="flex items-center text-slate-700 font-medium">
                  <IndianRupee size={14} className="mr-0.5 text-slate-400" />
                  {job.salary}
                </span>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {job.postedAt}
                </span>
             </div>
             <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View Details &rarr;
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};
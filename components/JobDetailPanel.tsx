import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { X, Share2, Bookmark, Check, Send, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from './ui/Badge';
import { generateJobDetails } from '../services/gemini';

// Simple markdown renderer replacement to avoid complex dependencies for this demo
const SimpleMarkdown = ({ text }: { text: string }) => {
  return (
    <div className="space-y-4 text-slate-600 leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-2">{line.replace('## ', '')}</h3>;
        if (line.startsWith('### ')) return <h4 key={i} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h4>;
        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-blue-500">{line.replace('- ', '')}</li>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  )
}

interface JobDetailPanelProps {
  job: Job | null;
  onClose: () => void;
  onSave: (job: Job) => void;
  isSaved: boolean;
}

const APPLICATION_STATUSES = ["Applied", "Interviewing", "Offer", "Rejected"];

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({ job, onClose, onSave, isSaved }) => {
  const [fullDescription, setFullDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setApplied(false);
      setStatus(null);
      setFullDescription(null);
      // Simulate checking cache or generating
      if (job.fullDescription) {
        setFullDescription(job.fullDescription);
      } else {
        setLoading(true);
        generateJobDetails(job).then(desc => {
          setFullDescription(desc);
          setLoading(false);
        });
      }
    }
  }, [job]);

  const handleApply = () => {
    if (job?.applyUrl) {
        window.open(job.applyUrl, '_blank');
    }
    setApplied(true);
    setStatus("Applied");
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setApplied(true);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="pointer-events-auto w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slideInRight overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => onSave(job)}
              className={`p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="flex items-start gap-5 mb-6">
            <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
               <img src={job.logoUrl} className="w-full h-full object-cover" alt="logo" />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-slate-900 leading-tight">{job.title}</h1>
               <p className="text-lg text-slate-600 font-medium mt-1">{job.company}</p>
               <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                 <span>{job.location}</span>
                 <span>•</span>
                 <span>{job.type}</span>
                 <span>•</span>
                 <span>{job.postedAt}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
             {job.tags.map(tag => (
               <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
             ))}
          </div>

          {/* AI Insights Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-8">
             <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                <Sparkles size={18} />
                <h3>Gemini Insights</h3>
             </div>
             <p className="text-sm text-blue-900/80 leading-relaxed">
               This role matches your profile well. The salary range of <span className="font-semibold">{job.salary}</span> is competitive for {job.location}. 
               Focus your application on your experience with {job.tags[0]} and {job.tags[1]}.
             </p>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none">
             <h3 className="text-lg font-bold text-slate-900 mb-3">About the role</h3>
             {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                  <div className="h-32 bg-slate-50 rounded w-full mt-4"></div>
                </div>
             ) : (
                <SimpleMarkdown text={fullDescription || job.description} />
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white z-10">
          {applied ? (
            <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Application Status</span>
                  <Badge variant={status === 'Offer' ? 'accent' : status === 'Rejected' ? 'secondary' : 'default'}>
                    {status}
                  </Badge>
               </div>
               
               <div className="relative">
                 <select
                   value={status || "Applied"}
                   onChange={handleStatusChange}
                   className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                 >
                   {APPLICATION_STATUSES.map(s => (
                     <option key={s} value={s}>{s}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                   <ChevronDown size={16} />
                 </div>
               </div>
               
               <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                  <Check size={12} className="text-green-500" />
                  We'll track this status for you
               </p>
            </div>
          ) : (
            <>
              <button 
                onClick={handleApply}
                className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all transform active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                 {job.applyUrl ? (
                    <ExternalLink size={20} className="mr-2" />
                 ) : (
                    <Send size={20} className="mr-2" />
                 )}
                 {job.applyUrl ? 'Apply on Company Site' : 'Apply Now'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                 {job.applyUrl ? 'Redirects to external job board' : 'Avg. response time: 2 days'}
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Briefcase, Loader2, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Job, SearchFilters, UserProfile, VoiceSearchParams } from '../types';
import { JobCard } from './JobCard';
import { searchJobsWithGemini } from '../services/gemini';
import { LocationAutocomplete } from './LocationAutocomplete';

interface SearchTabProps {
  onJobClick: (job: Job) => void;
  userProfile?: UserProfile;
  externalParams?: VoiceSearchParams | null;
  onDislike?: (job: Job) => void;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead / Manager", "Executive"];

export const SearchTab: React.FC<SearchTabProps> = ({ onJobClick, userProfile, externalParams, onDislike }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ 
    remote: false, 
    minSalary: 0,
    jobTypes: [],
    experienceLevel: ''
  });
  
  // Staging state for modal
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Track if we just received voice params to avoid infinite loops or double searches if params dont change
  const prevParamsRef = useRef<VoiceSearchParams | null>(null);

  // Handle External Params (Voice Search)
  useEffect(() => {
    if (externalParams && externalParams !== prevParamsRef.current) {
      prevParamsRef.current = externalParams;
      
      // Populate inputs
      setQuery(externalParams.query);
      setLocation(externalParams.location);
      setFilters(externalParams.filters);
      setTempFilters(externalParams.filters);

      // Trigger search immediately
      const performVoiceSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        const fullQuery = externalParams.location 
          ? `${externalParams.query} jobs in ${externalParams.location}` 
          : externalParams.query;
          
        const results = await searchJobsWithGemini(fullQuery, externalParams.filters, userProfile);
        setJobs(results);
        setLoading(false);
      };
      
      performVoiceSearch();
    }
  }, [externalParams, userProfile]);

  // Initial load
  useEffect(() => {
    if (!externalParams && !hasSearched) {
       handleSearch(true);
    }
  }, [userProfile]); 

  const handleSearch = async (initial = false) => {
    if (!initial && !query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    const results = await searchJobsWithGemini(fullQuery, filters, userProfile);
    setJobs(results);
    setLoading(false);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
    setLoading(true);
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, tempFilters, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
    });
  };

  const clearFilters = () => {
    const cleared = { remote: false, minSalary: 0, jobTypes: [], experienceLevel: '' };
    setTempFilters(cleared);
    setFilters(cleared);
    setIsFilterOpen(false);
    handleSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const openFilters = () => {
    setTempFilters(filters);
    setIsFilterOpen(true);
  };

  const removeFilter = (key: keyof SearchFilters, value?: string) => {
    const newFilters = { ...filters };
    if (key === 'jobTypes' && value) {
      newFilters.jobTypes = newFilters.jobTypes.filter(t => t !== value);
    } else if (key === 'remote') {
      newFilters.remote = false;
    } else if (key === 'minSalary') {
      newFilters.minSalary = 0;
    } else if (key === 'experienceLevel') {
      newFilters.experienceLevel = '';
    }
    setFilters(newFilters);
    setLoading(true);
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, newFilters, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
    });
  };

  const handleDislikeLocal = (jobToDislike: Job) => {
    // Remove immediately from UI
    setJobs(prev => prev.filter(j => j.id !== jobToDislike.id));
    // Propagate to parent to update profile preference
    if (onDislike) onDislike(jobToDislike);
  };

  const activeFilterCount = 
    (filters.remote ? 1 : 0) + 
    (filters.minSalary > 0 ? 1 : 0) + 
    filters.jobTypes.length + 
    (filters.experienceLevel ? 1 : 0);

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 sticky top-4 z-20">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 hidden md:block">
           {userProfile?.name ? `Jobs for ${userProfile.name.split(' ')[0]}` : 'Find your next dream job'}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             </div>
             <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder={userProfile?.currentRole ? `Try "${userProfile.currentRole}"...` : "Job title, keywords, or company"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
             />
          </div>

          <LocationAutocomplete 
            value={location}
            onChange={setLocation}
            onKeyDown={handleKeyDown}
          />

          <button 
             onClick={() => handleSearch()}
             disabled={loading}
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center min-w-[120px]"
          >
             {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-4">
           <button 
             onClick={openFilters}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all ${
               activeFilterCount > 0 
                 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
             }`}
           >
             <SlidersHorizontal size={14} />
             Filters
             {activeFilterCount > 0 && (
               <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                 {activeFilterCount}
               </span>
             )}
           </button>

           <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

           {filters.remote && (
             <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
               Remote
               <button onClick={() => removeFilter('remote')} className="hover:bg-indigo-200 rounded-full p-0.5"><X size={12} /></button>
             </span>
           )}
           {filters.minSalary > 0 && (
             <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
               ₹{filters.minSalary / 100000}L+
               <button onClick={() => removeFilter('minSalary')} className="hover:bg-green-200 rounded-full p-0.5"><X size={12} /></button>
             </span>
           )}
           {filters.experienceLevel && (
             <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
               {filters.experienceLevel}
               <button onClick={() => removeFilter('experienceLevel')} className="hover:bg-purple-200 rounded-full p-0.5"><X size={12} /></button>
             </span>
           )}
           {filters.jobTypes.map(type => (
             <span key={type} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
               {type}
               <button onClick={() => removeFilter('jobTypes', type)} className="hover:bg-blue-200 rounded-full p-0.5"><X size={12} /></button>
             </span>
           ))}
           
           {activeFilterCount > 0 && (
             <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-500 ml-auto md:ml-2 font-medium">
               Clear all
             </button>
           )}
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-end mb-2 px-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
               {loading ? 'Searching...' : `${jobs.length} Results Found`}
            </h2>
         </div>

         {loading ? (
           <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                         <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                         <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                         <div className="h-3 bg-slate-100 rounded w-full"></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <div className="grid gap-4">
             {jobs.map(job => (
               <JobCard key={job.id} job={job} onClick={onJobClick} onDislike={handleDislikeLocal} />
             ))}
             {jobs.length === 0 && hasSearched && (
               <div className="text-center py-20">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Briefcase className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
                  <p className="text-slate-500">Try adjusting your search terms or filters.</p>
               </div>
             )}
           </div>
         )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
           
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                   <Filter size={20} className="text-indigo-600" /> Filter Jobs
                 </h2>
                 <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                 
                 <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Job Type</h3>
                    <div className="flex flex-wrap gap-2">
                       {JOB_TYPES.map(type => {
                          const isSelected = tempFilters.jobTypes.includes(type);
                          return (
                            <button
                               key={type}
                               onClick={() => {
                                 setTempFilters(prev => ({
                                   ...prev,
                                   jobTypes: isSelected 
                                     ? prev.jobTypes.filter(t => t !== type)
                                     : [...prev.jobTypes, type]
                                 }));
                               }}
                               className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                 isSelected 
                                 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                                 : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                               }`}
                            >
                               {type}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Experience Level</h3>
                    <div className="space-y-2">
                       {EXPERIENCE_LEVELS.map(level => (
                          <label key={level} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                             <input 
                               type="radio" 
                               name="experience" 
                               checked={tempFilters.experienceLevel === level}
                               onChange={() => setTempFilters(prev => ({ ...prev, experienceLevel: level }))}
                               className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                             />
                             <span className="text-slate-700 font-medium">{level}</span>
                          </label>
                       ))}
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Minimum Salary (Annual)</h3>
                       <span className="text-sm font-semibold text-indigo-600">
                          {tempFilters.minSalary > 0 ? `₹${tempFilters.minSalary/100000}L+` : 'Any'}
                       </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000000" 
                      step="100000" 
                      value={tempFilters.minSalary}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, minSalary: Number(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                       <span>₹0</span>
                       <span>₹20L</span>
                       <span>₹50L+</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                       <h3 className="font-semibold text-slate-900">Remote Only</h3>
                       <p className="text-xs text-slate-500">Show only fully remote positions</p>
                    </div>
                    <button 
                       onClick={() => setTempFilters(prev => ({ ...prev, remote: !prev.remote }))}
                       className={`w-12 h-6 rounded-full transition-colors relative ${tempFilters.remote ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${tempFilters.remote ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between items-center">
                 <button onClick={clearFilters} className="text-slate-500 hover:text-slate-800 font-medium text-sm px-2">
                    Reset all
                 </button>
                 <button 
                    onClick={handleApplyFilters}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                 >
                    Show Results
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
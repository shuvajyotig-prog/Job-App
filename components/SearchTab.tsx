import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Briefcase, Loader2, X, SlidersHorizontal, ChevronDown, Plus, Sparkles, Heart, History, Trash2 } from 'lucide-react';
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

interface SavedSearchItem {
  id: string;
  title: string;
  query: string;
  location: string;
  filters: SearchFilters;
  createdAt: string;
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
    experienceLevel: '',
    prioritySkills: [],
    preferredCompanies: []
  });
  
  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const savedSearchRef = useRef<HTMLDivElement>(null);

  // Staging state for modal
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Input state for tags in modal
  const [skillInput, setSkillInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchSaved, setIsSearchSaved] = useState(false);

  // Track if we just received voice params to avoid infinite loops or double searches if params dont change
  const prevParamsRef = useRef<VoiceSearchParams | null>(null);

  // Load saved searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tgf_saved_searches');
      if (stored) {
        setSavedSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved searches", e);
    }
  }, []);

  // Close saved search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (savedSearchRef.current && !savedSearchRef.current.contains(event.target as Node)) {
        setShowSavedSearches(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setIsSearchSaved(false);
    
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    const results = await searchJobsWithGemini(fullQuery, filters, userProfile);
    setJobs(results);
    setLoading(false);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
    setLoading(true);
    setIsSearchSaved(false);
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, tempFilters, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
    });
  };

  const clearFilters = () => {
    const cleared = { 
        remote: false, 
        minSalary: 0, 
        jobTypes: [], 
        experienceLevel: '',
        prioritySkills: [],
        preferredCompanies: []
    };
    setTempFilters(cleared);
    setFilters(cleared);
    setIsFilterOpen(false);
    setIsSearchSaved(false);
    
    // Explicitly search with cleared filters to avoid state race condition
    setLoading(true);
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, cleared, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
    });
  };

  const handleSaveSearch = () => {
    const titleParts = [];
    if (query) titleParts.push(query);
    else if (filters.jobTypes.length > 0) titleParts.push(filters.jobTypes[0]);
    else titleParts.push("Jobs");
    
    if (location) titleParts.push(`in ${location}`);
    
    const newSearch: SavedSearchItem = {
        id: Date.now().toString(),
        title: titleParts.join(' '),
        query,
        location,
        filters,
        createdAt: new Date().toLocaleDateString()
    };

    const updated = [newSearch, ...savedSearches].slice(0, 8); // Keep last 8
    setSavedSearches(updated);
    localStorage.setItem('tgf_saved_searches', JSON.stringify(updated));

    setIsSearchSaved(true);
    setTimeout(() => setIsSearchSaved(false), 2000);
  };

  const handleDeleteSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('tgf_saved_searches', JSON.stringify(updated));
  };

  const applySavedSearch = (search: SavedSearchItem) => {
    setQuery(search.query);
    setLocation(search.location);
    setFilters(search.filters);
    setTempFilters(search.filters);
    setShowSavedSearches(false);

    // Trigger Search
    setLoading(true);
    const fullQuery = search.location ? `${search.query} jobs in ${search.location}` : search.query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, search.filters, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
      setHasSearched(true);
    });
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
    } else if (key === 'prioritySkills' && value) {
        newFilters.prioritySkills = newFilters.prioritySkills?.filter(s => s !== value);
    } else if (key === 'preferredCompanies' && value) {
        newFilters.preferredCompanies = newFilters.preferredCompanies?.filter(c => c !== value);
    }
    setFilters(newFilters);
    setLoading(true);
    setIsSearchSaved(false);
    const fullQuery = location ? `${query} jobs in ${location}` : query || (userProfile?.currentRole || "Frontend Developer");
    searchJobsWithGemini(fullQuery, newFilters, userProfile).then(results => {
      setJobs(results);
      setLoading(false);
    });
  };

  const handleAddTag = (type: 'skill' | 'company') => {
      if (type === 'skill' && skillInput.trim()) {
          setTempFilters(prev => ({
              ...prev,
              prioritySkills: [...(prev.prioritySkills || []), skillInput.trim()]
          }));
          setSkillInput('');
      } else if (type === 'company' && companyInput.trim()) {
          setTempFilters(prev => ({
              ...prev,
              preferredCompanies: [...(prev.preferredCompanies || []), companyInput.trim()]
          }));
          setCompanyInput('');
      }
  };

  const handleRemoveTag = (type: 'skill' | 'company', value: string) => {
      if (type === 'skill') {
          setTempFilters(prev => ({
              ...prev,
              prioritySkills: prev.prioritySkills?.filter(s => s !== value)
          }));
      } else {
          setTempFilters(prev => ({
              ...prev,
              preferredCompanies: prev.preferredCompanies?.filter(c => c !== value)
          }));
      }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, type: 'skill' | 'company') => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleAddTag(type);
      }
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
    (filters.experienceLevel ? 1 : 0) +
    (filters.prioritySkills?.length || 0) +
    (filters.preferredCompanies?.length || 0);

  return (
    <div className="max-w-5xl mx-auto pb-24 relative">
      
      {/* Search Header Block */}
      <div className="bg-white rounded-[2rem] shadow-neo border-2 border-neo-black p-6 mb-10 sticky top-4 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <div>
                <h1 className="text-3xl font-display font-black text-neo-black tracking-tight">
                {userProfile?.name ? `Hey ${userProfile.name.split(' ')[0]}!` : 'Find Your Gig'}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Ready for your next big move?</p>
             </div>
             <div className="hidden md:block">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-acid rounded-full border-2 border-neo-black shadow-sm font-bold text-xs">
                    <Sparkles size={12} fill="black" /> AI Powered
                 </div>
             </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-neo-black" strokeWidth={3} />
             </div>
             <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border-2 border-neo-black rounded-xl text-lg font-medium bg-white placeholder-slate-400 focus:outline-none focus:shadow-neo-sm focus:bg-purple-50 transition-all"
                placeholder={userProfile?.currentRole ? `Try "${userProfile.currentRole}"...` : "Job title, keywords..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
             />
          </div>

          <div className="md:w-1/3">
             <LocationAutocomplete 
                value={location}
                onChange={setLocation}
                onKeyDown={handleKeyDown}
             />
          </div>

          <button 
             onClick={() => handleSearch()}
             disabled={loading}
             className="bg-electric hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-xl border-2 border-neo-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center min-w-[120px]"
          >
             {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Search'}
          </button>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6 relative">
           <button 
             onClick={openFilters}
             className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${
               activeFilterCount > 0 
                 ? 'bg-neo-black text-white border-neo-black' 
                 : 'bg-white text-neo-black border-neo-black hover:bg-slate-50'
             }`}
           >
             <SlidersHorizontal size={16} />
             Filters
             {activeFilterCount > 0 && (
               <span className="ml-1 bg-acid text-neo-black text-[10px] font-black px-1.5 py-0.5 rounded-full border border-neo-black">
                 {activeFilterCount}
               </span>
             )}
           </button>

           <div className="relative" ref={savedSearchRef}>
             <button 
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${
                  showSavedSearches
                   ? 'bg-slate-100 text-neo-black border-neo-black'
                   : 'bg-white text-neo-black border-neo-black hover:bg-slate-50'
                }`}
             >
                <History size={16} />
                Saved
             </button>

             {/* Saved Searches Dropdown */}
             {showSavedSearches && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border-2 border-neo-black shadow-neo z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 px-4 py-2 border-b-2 border-neo-black text-xs font-black uppercase text-slate-500 tracking-wider">
                       Your Stashed Searches
                    </div>
                    {savedSearches.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm font-medium">
                           No saved searches yet.
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                           {savedSearches.map(search => (
                               <div key={search.id} onClick={() => applySavedSearch(search)} className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-0 group">
                                   <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0 pr-2">
                                         <p className="font-bold text-neo-black truncate">{search.title}</p>
                                         <p className="text-xs text-slate-500 mt-0.5">{search.createdAt}</p>
                                      </div>
                                      <button 
                                        onClick={(e) => handleDeleteSearch(e, search.id)}
                                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                      >
                                         <Trash2 size={14} />
                                      </button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    )}
                </div>
             )}
           </div>

           <div className="h-8 w-0.5 bg-slate-200 mx-1 hidden md:block"></div>

           {/* Active Filter Chips - Neo Brutalist Style */}
           {filters.remote && (
             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-neo-black border-2 border-neo-black shadow-[2px_2px_0px_black]">
               REMOTE
               <button onClick={() => removeFilter('remote')} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
             </span>
           )}
           {filters.minSalary > 0 && (
             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-900 border-2 border-neo-black shadow-[2px_2px_0px_black]">
               ₹{filters.minSalary / 100000}L+
               <button onClick={() => removeFilter('minSalary')} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
             </span>
           )}
           {filters.experienceLevel && (
             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-900 border-2 border-neo-black shadow-[2px_2px_0px_black]">
               {filters.experienceLevel.toUpperCase()}
               <button onClick={() => removeFilter('experienceLevel')} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
             </span>
           )}
           {filters.jobTypes.map(type => (
             <span key={type} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border-2 border-neo-black shadow-[2px_2px_0px_black]">
               {type.toUpperCase()}
               <button onClick={() => removeFilter('jobTypes', type)} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
             </span>
           ))}
           {filters.prioritySkills?.map(skill => (
               <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-900 border-2 border-neo-black shadow-[2px_2px_0px_black]">
                   {skill.toUpperCase()}
                   <button onClick={() => removeFilter('prioritySkills', skill)} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
               </span>
           ))}
           {filters.preferredCompanies?.map(comp => (
               <span key={comp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-900 border-2 border-neo-black shadow-[2px_2px_0px_black]">
                   {comp.toUpperCase()}
                   <button onClick={() => removeFilter('preferredCompanies', comp)} className="hover:text-red-600"><X size={14} strokeWidth={3} /></button>
               </span>
           ))}

            {/* Save Search Button */}
            {(query || location || activeFilterCount > 0) && (
             <button 
               onClick={handleSaveSearch}
               className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all shadow-[2px_2px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                 isSearchSaved 
                 ? 'bg-hot-pink text-white border-neo-black' 
                 : 'bg-white text-neo-black border-neo-black hover:bg-pink-50'
               }`}
             >
               <Heart size={14} className={isSearchSaved ? "fill-current" : ""} />
               {isSearchSaved ? 'Saved!' : 'Save Search'}
             </button>
           )}
           
           {activeFilterCount > 0 && (
             <button onClick={clearFilters} className={`text-xs font-bold text-neo-black underline decoration-2 decoration-red-500 hover:text-red-600 ${!(query || location || activeFilterCount > 0) ? 'ml-auto' : ''}`}>
               Clear All
             </button>
           )}
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-end mb-2 px-2">
            <h2 className="text-base font-black text-neo-black uppercase tracking-wider bg-acid inline-block px-2 transform -rotate-1">
               {loading ? 'Searching...' : `${jobs.length} Results Found`}
            </h2>
         </div>

         {loading ? (
           <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border-2 border-neo-black shadow-sm animate-pulse">
                   <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-200 rounded-xl border-2 border-slate-300"></div>
                      <div className="flex-1 space-y-3">
                         <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                         <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                         <div className="h-4 bg-slate-200 rounded w-full"></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <div className="grid gap-6">
             {jobs.map(job => (
               <JobCard key={job.id} job={job} onClick={onJobClick} onDislike={handleDislikeLocal} />
             ))}
             {jobs.length === 0 && hasSearched && (
               <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-neo-black border-dashed">
                  <div className="bg-acid w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-neo-black shadow-neo">
                     <Briefcase className="text-neo-black" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-neo-black font-display">No gigs found</h3>
                  <p className="text-slate-600 font-medium">Try adjusting your filters or search for something else.</p>
               </div>
             )}
           </div>
         )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-neo-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
           
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh] border-2 border-neo-black animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b-2 border-neo-black bg-purple-50 rounded-t-[2rem]">
                 <h2 className="text-2xl font-black text-neo-black flex items-center gap-2 font-display">
                   <Filter size={24} className="text-electric" /> FILTER GIGS
                 </h2>
                 <button onClick={() => setIsFilterOpen(false)} className="text-neo-black hover:bg-red-100 p-2 rounded-xl border-2 border-transparent hover:border-neo-black transition-all">
                    <X size={24} strokeWidth={3} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                 
                 {/* Priority Skills Input */}
                 <div>
                    <h3 className="text-sm font-black text-neo-black uppercase tracking-wider mb-3">Priority Skills</h3>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            className="flex-1 border-2 border-neo-black rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:shadow-neo-sm"
                            placeholder="e.g. React, Python"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => handleTagInputKeyDown(e, 'skill')}
                        />
                        <button 
                            onClick={() => handleAddTag('skill')}
                            className="bg-neo-black text-white p-2.5 rounded-xl border-2 border-neo-black hover:bg-gray-800"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tempFilters.prioritySkills?.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-neo-black border-2 border-neo-black">
                                {skill}
                                <button onClick={() => handleRemoveTag('skill', skill)} className="hover:text-red-600"><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                 </div>

                 {/* Preferred Companies Input */}
                 <div>
                    <h3 className="text-sm font-black text-neo-black uppercase tracking-wider mb-3">Target Companies</h3>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            className="flex-1 border-2 border-neo-black rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:shadow-neo-sm"
                            placeholder="e.g. Google, Microsoft"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            onKeyDown={(e) => handleTagInputKeyDown(e, 'company')}
                        />
                        <button 
                            onClick={() => handleAddTag('company')}
                            className="bg-neo-black text-white p-2.5 rounded-xl border-2 border-neo-black hover:bg-gray-800"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tempFilters.preferredCompanies?.map(comp => (
                            <span key={comp} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-teal-100 text-neo-black border-2 border-neo-black">
                                {comp}
                                <button onClick={() => handleRemoveTag('company', comp)} className="hover:text-red-600"><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-sm font-black text-neo-black uppercase tracking-wider mb-3">Job Type</h3>
                    <div className="flex flex-wrap gap-3">
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
                               className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all shadow-sm ${
                                 isSelected 
                                 ? 'bg-electric text-white border-neo-black shadow-[2px_2px_0px_black]' 
                                 : 'bg-white text-slate-600 border-slate-200 hover:border-neo-black'
                               }`}
                            >
                               {type}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-black text-neo-black uppercase tracking-wider mb-3">Experience Level</h3>
                    <div className="space-y-3">
                       {EXPERIENCE_LEVELS.map(level => (
                          <label key={level} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-neo-black hover:bg-slate-50 cursor-pointer transition-all">
                             <input 
                               type="radio" 
                               name="experience" 
                               checked={tempFilters.experienceLevel === level}
                               onChange={() => setTempFilters(prev => ({ ...prev, experienceLevel: level }))}
                               className="w-5 h-5 text-electric border-2 border-neo-black focus:ring-offset-0 focus:ring-0"
                             />
                             <span className="text-neo-black font-bold">{level}</span>
                          </label>
                       ))}
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-black text-neo-black uppercase tracking-wider">Minimum Salary (Annual)</h3>
                       <span className="text-sm font-black bg-green-100 text-green-900 px-2 py-1 rounded border-2 border-neo-black">
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
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-electric border-2 border-neo-black"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                       <span>₹0</span>
                       <span>₹20L</span>
                       <span>₹50L+</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-acid/20 rounded-xl border-2 border-neo-black">
                    <div>
                       <h3 className="font-bold text-neo-black">Remote Only</h3>
                       <p className="text-xs text-slate-600 font-medium">Show only fully remote positions</p>
                    </div>
                    <button 
                       onClick={() => setTempFilters(prev => ({ ...prev, remote: !prev.remote }))}
                       className={`w-14 h-8 rounded-full border-2 border-neo-black transition-colors relative ${tempFilters.remote ? 'bg-electric' : 'bg-white'}`}
                    >
                       <div className={`w-5 h-5 bg-white border-2 border-neo-black rounded-full absolute top-1 transition-transform ${tempFilters.remote ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

              </div>

              <div className="p-6 border-t-2 border-neo-black bg-white rounded-b-[2rem] flex justify-between items-center">
                 <button onClick={clearFilters} className="text-slate-500 hover:text-neo-black font-bold text-sm px-2 underline decoration-2 hover:decoration-red-500">
                    Clear Filters
                 </button>
                 <button 
                    onClick={handleApplyFilters}
                    className="bg-neo-black hover:bg-gray-800 text-white font-black py-3 px-8 rounded-xl border-2 border-transparent shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                 >
                    SHOW RESULTS
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
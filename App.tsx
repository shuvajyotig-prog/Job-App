import React, { useState } from 'react';
import { ViewState, Job, UserProfile, VoiceSearchParams } from './types';
import { Sidebar } from './components/Sidebar';
import { SearchTab } from './components/SearchTab';
import { JobDetailPanel } from './components/JobDetailPanel';
import { ProfileTab } from './components/ProfileTab';
import { CareerFeedTab } from './components/CareerFeedTab';
import { CoachTab } from './components/CoachTab';
import { Bookmark, Search, UserCircle, Newspaper, Bot } from 'lucide-react'; 
import { JobCard } from './components/JobCard';
import { VoiceWidget } from './components/VoiceWidget';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('search');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  
  // Store voice parameters to trigger search in SearchTab
  const [voiceParams, setVoiceParams] = useState<VoiceSearchParams | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Arjun Mehta',
    currentRole: 'Senior Frontend Engineer',
    bio: 'Passionate UI/UX specialist building scalable web apps. Looking for challenging roles in Bangalore or Remote.',
    education: 'B.Tech in Computer Science, IIT Bombay (2018)',
    experienceSummary: '5 years of experience in React ecosystem. Led a team of 4 at a fintech startup.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    yearsExperience: 5,
    preferences: {
      remote: false,
      minSalary: 1500000, // 15 LPA
      locations: ['Bangalore', 'Mumbai']
    },
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    dislikedJobs: [] // Init
  });

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseDetail = () => {
    setSelectedJob(null);
  };

  const handleSaveJob = (job: Job) => {
    setSavedJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (exists) {
        return prev.filter(j => j.id !== job.id);
      }
      return [...prev, job];
    });
  };

  const handleDislikeJob = (job: Job) => {
    // 1. Update user profile so AI knows to avoid this
    setUserProfile(prev => ({
      ...prev,
      dislikedJobs: [...(prev.dislikedJobs || []), { title: job.title, company: job.company }]
    }));

    // 2. Remove from saved if it was there
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));

    // 3. Close panel if open
    if (selectedJob?.id === job.id) {
       setSelectedJob(null);
    }
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleVoiceSearch = (params: VoiceSearchParams) => {
    setVoiceParams(params);
    setView('search');
  };

  const isSaved = (job: Job) => savedJobs.some(j => j.id === job.id);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        savedCount={savedJobs.length}
        userName={userProfile.name}
        userAvatar={userProfile.avatarUrl}
        userRole={userProfile.currentRole}
      />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar relative">
        <div className={`h-full ${view === 'coach' ? 'p-0' : 'p-4 md:p-8 max-w-7xl mx-auto'}`}>
          
          {view === 'search' && (
            <SearchTab 
              onJobClick={handleJobClick} 
              userProfile={userProfile} 
              externalParams={voiceParams}
              onDislike={handleDislikeJob}
            />
          )}

          {view === 'feed' && (
             <CareerFeedTab />
          )}

          {view === 'coach' && (
             <CoachTab userProfile={userProfile} />
          )}

          {view === 'profile' && (
             <ProfileTab profile={userProfile} onSave={handleSaveProfile} />
          )}

          {view === 'saved' && (
            <div className="max-w-4xl mx-auto">
               <h1 className="text-2xl font-bold text-slate-900 mb-6">Saved Jobs</h1>
               {savedJobs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                     <Bookmark className="mx-auto text-slate-300 mb-4" size={48} />
                     <p className="text-slate-500 text-lg">You haven't saved any jobs yet.</p>
                     <button onClick={() => setView('search')} className="text-blue-600 font-medium mt-2 hover:underline">
                        Go to Search
                     </button>
                  </div>
               ) : (
                  <div className="grid gap-4">
                     {savedJobs.map(job => (
                        <JobCard key={job.id} job={job} onClick={handleJobClick} onDislike={handleDislikeJob} />
                     ))}
                  </div>
               )}
            </div>
          )}

        </div>
      </main>

      {/* Show global voice widget unless in coach mode, where it has its own input */}
      {view !== 'coach' && <VoiceWidget onSearch={handleVoiceSearch} />}

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-2 flex justify-between items-center shadow-lg">
         <button 
           onClick={() => setView('search')} 
           className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${view === 'search' ? 'text-blue-600' : 'text-slate-400'}`}
         >
           <Search size={22} />
           <span className="text-[10px] font-medium mt-1">Search</span>
         </button>
         <button 
           onClick={() => setView('feed')} 
           className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${view === 'feed' ? 'text-blue-600' : 'text-slate-400'}`}
         >
           <Newspaper size={22} />
           <span className="text-[10px] font-medium mt-1">Feed</span>
         </button>
         <button 
           onClick={() => setView('coach')} 
           className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${view === 'coach' ? 'text-blue-600' : 'text-slate-400'}`}
         >
           <Bot size={22} />
           <span className="text-[10px] font-medium mt-1">Coach</span>
         </button>
         <button 
           onClick={() => setView('saved')} 
           className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${view === 'saved' ? 'text-blue-600' : 'text-slate-400'} relative`}
         >
           <Bookmark size={22} />
           {savedJobs.length > 0 && (
             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
           )}
           <span className="text-[10px] font-medium mt-1">Saved</span>
         </button>
         <button 
           onClick={() => setView('profile')} 
           className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${view === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
         >
            {userProfile.avatarUrl ? (
               <div className="w-6 h-6 rounded-full overflow-hidden mb-1 border border-slate-200">
                  <img src={userProfile.avatarUrl} alt="Me" className="w-full h-full object-cover" />
               </div>
            ) : (
               <UserCircle size={22} />
            )}
           <span className="text-[10px] font-medium mt-1">Profile</span>
         </button>
      </div>

      {selectedJob && (
        <JobDetailPanel 
          job={selectedJob} 
          onClose={handleCloseDetail} 
          onSave={handleSaveJob}
          isSaved={isSaved(selectedJob)}
        />
      )}

    </div>
  );
};

export default App;
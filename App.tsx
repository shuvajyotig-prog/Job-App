import React, { useState, useEffect } from 'react';
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
import { LoginPage } from './components/LoginPage';
import { TopBar } from './components/TopBar';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('search');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  
  // Store voice parameters to trigger search in SearchTab
  const [voiceParams, setVoiceParams] = useState<VoiceSearchParams | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(authService.getCurrentUser());

  const handleLogin = (user: UserProfile) => {
    setUserProfile(user);
  };

  const handleLogout = () => {
    authService.logout();
    setUserProfile(null);
    setView('search'); // Reset view
  };

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
    if (!userProfile) return;
    
    // 1. Update user profile so AI knows to avoid this
    setUserProfile(prev => prev ? ({
      ...prev,
      dislikedJobs: [...(prev.dislikedJobs || []), { title: job.title, company: job.company }]
    }) : null);

    // 2. Remove from saved if it was there
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));

    // 3. Close panel if open
    if (selectedJob?.id === job.id) {
       setSelectedJob(null);
    }
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    // Also update in local storage if it's the current user
    // In a real app, this would be an API call
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
       // We need to merge with existing auth data (email/pass) which we don't have here
       // For this demo, we just update the profile part in memory. 
       // To persist, we'd need to update authService to support profile updates.
       // For now, let's just update state.
    }
  };

  const handleVoiceSearch = (params: VoiceSearchParams) => {
    setVoiceParams(params);
    setView('search');
  };

  const isSaved = (job: Job) => savedJobs.some(j => j.id === job.id);

  if (!userProfile) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        savedCount={savedJobs.length}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* Top Bar with Profile & Settings */}
        <TopBar 
          userAvatar={userProfile.avatarUrl} 
          userName={userProfile.name} 
          onProfileClick={() => setView('profile')} 
        />

        <div className={`flex-1 ${view === 'coach' ? 'p-0' : 'p-4 md:p-8 max-w-7xl mx-auto w-full'}`}>
          
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
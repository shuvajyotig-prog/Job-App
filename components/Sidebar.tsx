import React from 'react';
import { ViewState } from '../types';
import { Compass, Bookmark, Settings, UserCircle, Zap, Newspaper } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  savedCount: number;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

interface NavItem {
  id: ViewState;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, savedCount, userName, userAvatar, userRole }) => {
  const navItems: NavItem[] = [
    { id: 'search', label: 'Search & Explore', icon: Compass },
    { id: 'feed', label: 'Career Feed', icon: Newspaper },
    { id: 'saved', label: 'Stashed', icon: Bookmark, badge: savedCount },
    { id: 'profile', label: 'My Vibe', icon: UserCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-6">
      {/* Floating Card Container */}
      <div className="flex flex-col h-full bg-white border-2 border-neo-black rounded-[2rem] shadow-neo overflow-hidden">
        
        <div className="p-6 border-b-2 border-neo-black bg-acid/20">
          <div className="flex items-center gap-2 text-neo-black font-display font-bold text-2xl tracking-tighter">
             <div className="w-10 h-10 bg-neo-black text-acid rounded-xl flex items-center justify-center border-2 border-transparent shadow-sm transform -rotate-3">
                <Zap size={24} fill="currentColor" />
             </div>
             GigFinder
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3">
           {navItems.map(item => {
             const isActive = currentView === item.id;
             const Icon = item.icon;
             return (
               <button
                 key={item.id}
                 onClick={() => onChangeView(item.id)}
                 className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 group border-2 ${
                   isActive 
                    ? 'bg-neo-black text-white border-neo-black shadow-[4px_4px_0px_0px_#ccff00] translate-x-[-2px] translate-y-[-2px]' 
                    : 'bg-white text-slate-600 border-transparent hover:border-neo-black hover:bg-slate-50'
                 }`}
               >
                 <div className="flex items-center gap-3">
                   <Icon size={20} className={isActive ? 'text-acid' : 'text-slate-400 group-hover:text-neo-black'} strokeWidth={2.5} />
                   <span className={`font-display font-bold ${isActive ? 'text-lg' : 'text-base'}`}>{item.label}</span>
                 </div>
                 {item.badge !== undefined && item.badge > 0 && (
                   <span className={`text-xs font-black px-2 py-1 rounded-full border border-neo-black ${isActive ? 'bg-acid text-neo-black' : 'bg-slate-200 text-neo-black'}`}>
                      {item.badge}
                   </span>
                 )}
               </button>
             );
           })}
        </nav>

        <div className="p-4 border-t-2 border-neo-black bg-slate-50">
           <div 
             onClick={() => onChangeView('profile')}
             className={`flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:border-neo-black hover:bg-white cursor-pointer transition-all ${currentView === 'profile' ? 'bg-white border-neo-black' : ''}`}
           >
              <div className="w-10 h-10 rounded-full bg-acid border-2 border-neo-black shadow-sm flex items-center justify-center text-neo-black font-bold text-sm overflow-hidden shrink-0">
                 {userAvatar ? (
                   <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                 ) : (
                   userName ? userName.charAt(0) : 'U'
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold font-display text-neo-black truncate">{userName || 'User Profile'}</p>
                 <p className="text-xs text-slate-500 font-medium truncate">{userRole || 'Job Seeker'}</p>
              </div>
              <Settings size={18} className="text-neo-black" />
           </div>
        </div>
      </div>
    </aside>
  );
};
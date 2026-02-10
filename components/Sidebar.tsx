import React from 'react';
import { ViewState } from '../types';
import { Search, Compass, Bookmark, Settings, LogOut, UserCircle, Briefcase } from 'lucide-react';

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
    { id: 'search', label: 'Search Jobs', icon: Search },
    { id: 'discovery', label: 'Discover', icon: Compass },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedCount },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={18} strokeWidth={3} />
           </div>
           TheGigFinder
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
         {navItems.map(item => {
           const isActive = currentView === item.id;
           const Icon = item.icon;
           return (
             <button
               key={item.id}
               onClick={() => onChangeView(item.id)}
               className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                 isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
               }`}
             >
               <div className="flex items-center gap-3">
                 <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                 <span>{item.label}</span>
               </div>
               {item.badge !== undefined && item.badge > 0 && (
                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                    {item.badge}
                 </span>
               )}
             </button>
           );
         })}
      </nav>

      <div className="p-4 border-t border-slate-100">
         <div 
           onClick={() => onChangeView('profile')}
           className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${currentView === 'profile' ? 'bg-slate-50' : ''}`}
         >
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold text-sm overflow-hidden shrink-0">
               {userAvatar ? (
                 <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
               ) : (
                 userName ? userName.charAt(0) : 'U'
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-slate-900 truncate">{userName || 'User Profile'}</p>
               <p className="text-xs text-slate-500 truncate">{userRole || 'Job Seeker'}</p>
            </div>
            <Settings size={16} className="text-slate-400" />
         </div>
      </div>
    </aside>
  );
};
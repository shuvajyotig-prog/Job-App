import React from 'react';
import { Settings, UserCircle } from 'lucide-react';

interface TopBarProps {
  userAvatar?: string;
  userName?: string;
  onProfileClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userAvatar, userName, onProfileClick }) => {
  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-8 z-30 flex items-center gap-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 bg-white pl-4 pr-2 py-2 rounded-full border-2 border-neo-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
        >
          <span className="font-display font-bold text-neo-black text-sm hidden md:block group-hover:text-blue-600 transition-colors">
            {userName || 'Profile'}
          </span>
          <div className="w-8 h-8 rounded-full bg-acid border-2 border-neo-black flex items-center justify-center overflow-hidden">
             {userAvatar ? (
               <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={20} className="text-neo-black" />
             )}
          </div>
        </button>
        
        <button 
          onClick={onProfileClick}
          className="w-12 h-12 bg-white rounded-full border-2 border-neo-black shadow-neo flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-neo-black hover:text-blue-600"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

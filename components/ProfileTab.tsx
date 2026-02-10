import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { User, Briefcase, Award, Save, Plus, X, MapPin, Sparkles, Upload, IndianRupee } from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkill, setNewSkill] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
    setIsSaved(false);
  };

  const addSkill = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
      setIsSaved(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    setIsSaved(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
               <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 overflow-hidden shadow-xl">
                 {formData.avatarUrl ? (
                   <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   formData.name.charAt(0) || 'U'
                 )}
               </div>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                 title="Upload Photo"
               >
                  <Upload size={16} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 accept="image/*" 
                 className="hidden" 
               />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{formData.name || 'Your Profile'}</h1>
              <p className="text-indigo-100 flex items-center justify-center md:justify-start gap-2 mt-1">
                <Sparkles size={16} /> 
                Update your details to get AI-personalized matches
              </p>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-20 -mb-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="text-indigo-500" size={20} /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Arjun Mehta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                <input 
                  type="text" 
                  name="currentRole" 
                  value={formData.currentRole} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Professional Bio</label>
               <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Briefly describe your experience and what you're looking for..."
               />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Skills & Experience */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <Award className="text-purple-500" size={20} /> Skills & Experience
             </h2>
             
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                <input 
                  type="number" 
                  name="yearsExperience" 
                  value={formData.yearsExperience} 
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full md:w-32 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                   {formData.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-100">
                         {skill}
                         <button onClick={() => removeSkill(skill)} className="hover:text-indigo-900"><X size={14} /></button>
                      </span>
                   ))}
                </div>
                <div className="flex gap-2">
                   <input 
                     type="text"
                     value={newSkill}
                     onChange={(e) => setNewSkill(e.target.value)}
                     onKeyDown={addSkill}
                     placeholder="Type a skill and press Enter (e.g., React, Python)"
                     className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                   />
                   <button 
                     onClick={() => addSkill()}
                     className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                   >
                     <Plus size={20} />
                   </button>
                </div>
             </div>
          </section>

          <hr className="border-slate-100" />

          {/* Preferences */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <Briefcase className="text-green-500" size={20} /> Preferences
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                   <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                         <MapPin size={16} /> Remote Work
                      </h3>
                      <p className="text-xs text-slate-500">Only show fully remote jobs</p>
                   </div>
                   <button 
                       onClick={() => handlePreferenceChange('remote', !formData.preferences.remote)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${formData.preferences.remote ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.preferences.remote ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                   <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                      <IndianRupee size={16} /> Minimum Salary
                   </h3>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="5000000" 
                        step="100000" 
                        value={formData.preferences.minSalary}
                        onChange={(e) => handlePreferenceChange('minSalary', Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <span className="text-sm font-mono font-bold text-slate-700 min-w-[80px]">
                         ₹{formData.preferences.minSalary / 100000}L
                      </span>
                   </div>
                   <div className="flex justify-between text-xs text-slate-400 mt-2">
                       <span>₹0</span>
                       <span>₹50L+</span>
                   </div>
                </div>
             </div>
          </section>

          {/* Save Button */}
          <div className="pt-4 flex justify-end sticky bottom-0 bg-white py-4 border-t border-slate-100 -mx-8 px-8 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <button 
               onClick={handleSave}
               className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${
                 isSaved 
                 ? 'bg-green-600 shadow-green-200' 
                 : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
               }`}
             >
               {isSaved ? <><div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div> Saved!</> : <><Save size={20} /> Save Changes</>}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
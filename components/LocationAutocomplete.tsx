import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

interface CityResult {
  id: number;
  name: string;
  admin1?: string; // State/Region
  country: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange, onKeyDown }) => {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      onChange(newVal);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (newVal.length < 3) {
          setSuggestions([]);
          setIsOpen(false);
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      timeoutRef.current = window.setTimeout(async () => {
          try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newVal)}&count=5&language=en&format=json`);
            const data = await response.json();
            if (data.results) {
                setSuggestions(data.results);
                setIsOpen(true);
            } else {
                setSuggestions([]);
            }
          } catch (err) {
              console.error(err);
          } finally {
              setIsLoading(false);
          }
      }, 300);
  }

  const handleSelect = (city: CityResult) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const parts = [city.name];
    if (city.admin1) parts.push(city.admin1);
    parts.push(city.country);
    
    const fullLocation = parts.join(', ');
    onChange(fullLocation);
    
    setIsOpen(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 relative group md:max-w-xs" ref={wrapperRef}>
       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
             <Loader2 className="h-6 w-6 text-electric animate-spin" />
          ) : (
             <MapPin className="h-6 w-6 text-neo-black" strokeWidth={3} />
          )}
       </div>
       <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border-2 border-neo-black rounded-xl text-lg font-medium bg-white placeholder-slate-400 focus:outline-none focus:shadow-neo-sm focus:bg-purple-50 transition-all"
          placeholder="City, State..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => { if (value.length > 2 && suggestions.length > 0) setIsOpen(true); }}
       />
       
       {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-neo-black rounded-xl shadow-neo overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="max-h-60 overflow-y-auto custom-scrollbar">
               {suggestions.map((city) => (
                  <button
                     key={city.id}
                     onClick={() => handleSelect(city)}
                     className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 text-sm text-neo-black transition-colors border-b-2 border-slate-100 last:border-0 group/item"
                  >
                     <div className="p-1.5 bg-slate-100 rounded-full border border-slate-300 group-hover/item:bg-white group-hover/item:border-neo-black transition-colors">
                        <MapPin size={14} className="text-slate-400 group-hover/item:text-neo-black" />
                     </div>
                     <span className="flex-1">
                        <span className="font-bold text-neo-black">{city.name}</span>
                        <span className="text-slate-500 ml-1 font-medium">
                          {city.admin1 ? `, ${city.admin1}` : ''}, {city.country}
                        </span>
                     </span>
                  </button>
               ))}
             </div>
             <div className="bg-slate-50 px-3 py-1.5 border-t-2 border-neo-black text-[10px] text-slate-500 font-bold text-center uppercase tracking-wide">
                Suggestions by Open-Meteo
             </div>
          </div>
       )}
    </div>
  );
};
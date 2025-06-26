import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' }
];

export function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button 
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors text-xs"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="mr-1">{currentLanguage.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 p-1 bg-background border border-border rounded-md shadow-lg z-50">
          <ul className="space-y-1">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-sm rounded-sm flex items-center gap-2 hover:bg-accent",
                    currentLang === lang.code ? "bg-primary/10" : ""
                  )}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span className="text-base">{lang.flag}</span> 
                  <span>{lang.nativeName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
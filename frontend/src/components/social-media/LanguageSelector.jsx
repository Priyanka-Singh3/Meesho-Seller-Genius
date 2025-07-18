import React from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
];

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage, loading }) => (
  <div className="w-full mb-4">
    <label className="font-semibold text-[#9B177E] mb-1 block">Post Language</label>
    <div className="mt-2">
      <select
        className="w-full border border-[#9B177E] rounded-lg py-2 pl-4 pr-8 text-lg bg-white text-[#9B177E] font-medium appearance-none"
        value={selectedLanguage}
        onChange={e => setSelectedLanguage(e.target.value)}
        disabled={loading}
        style={{
          background: `url('data:image/svg+xml;utf8,<svg fill="%239B177E" height="18" viewBox="0 0 20 20" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>') no-repeat right 1.2rem center/1.1em`,
        }}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default LanguageSelector; 
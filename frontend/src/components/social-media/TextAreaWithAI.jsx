import React from 'react';
import CustomPromptPopover from './CustomPromptPopover';

const TextAreaWithAI = ({
  value,
  setValue,
  placeholder,
  onAIRefine,
  onCustomPrompt,
  loading,
  customPromptLoading,
  showCustomPrompt,
  setShowCustomPrompt,
  customPromptRef,
  icon,
  disabled
}) => (
  <div className="relative flex items-center">
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => setValue(e.target.value)}
      required
      className="border p-2 w-full pr-20"
      rows={4}
      style={{ borderRadius: 0 }}
      disabled={disabled}
    />
    <div className="absolute bottom-2 right-2 flex gap-2">
      <button
        type="button"
        className="p-0 m-0 bg-transparent border-none shadow-none hover:bg-transparent"
        title="Refine with AI"
        onClick={onAIRefine}
        disabled={loading}
        style={{ fontSize: '1.1em', lineHeight: 1, color: '#9B177E' }}
      >
        {icon}
      </button>
      <button
        type="button"
        className="p-0 m-0 bg-transparent border-none shadow-none hover:bg-transparent"
        title="Custom AI Prompt"
        ref={customPromptRef}
        onClick={() => setShowCustomPrompt(true)}
        style={{ fontSize: '1.1em', lineHeight: 1, color: '#9B177E' }}
      >
        <svg width="22" height="22" fill="none" stroke="#9B177E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
      </button>
      {showCustomPrompt && (
        <CustomPromptPopover
          open={showCustomPrompt}
          onClose={() => setShowCustomPrompt(false)}
          loading={customPromptLoading}
          onSubmit={onCustomPrompt}
        />
      )}
    </div>
  </div>
);

export default TextAreaWithAI; 
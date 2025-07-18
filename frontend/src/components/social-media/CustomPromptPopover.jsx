import React, { useState } from 'react';

function CustomPromptPopover({ open, onClose, onSubmit, loading }) {
  const [prompt, setPrompt] = useState('');
  if (!open) return null;
  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 bg-white border border-[#9B177E] rounded shadow p-2 flex gap-2 items-center"
      style={{ minWidth: 220, maxWidth: 320 }}
    >
      <input
        className="flex-1 border border-[#9B177E] rounded p-1 text-sm"
        placeholder="Custom prompt..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        autoFocus
      />
      <button
        className="px-2 py-1 rounded bg-[#9B177E] text-white text-sm"
        disabled={loading || !prompt.trim()}
        onClick={() => { onSubmit(prompt); setPrompt(''); }}
      >
        {loading ? '...' : 'Run'}
      </button>
      <button
        className="ml-1 text-gray-400 hover:text-gray-700"
        onClick={() => { setPrompt(''); onClose(); }}
        tabIndex={-1}
      >✕</button>
    </div>
  );
}

export default CustomPromptPopover; 
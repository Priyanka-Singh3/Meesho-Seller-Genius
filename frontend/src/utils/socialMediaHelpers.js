// Helper to safely render text or error
export function safeText(val) {
  if (!val) return '';
  if (typeof val === 'object' && val.error) return val.error;
  return val;
}

// Helper to split main text and hashtags
export function splitTextAndTags(text) {
  const tags = text.match(/#[\w]+/g) || [];
  const main = text.replace(/#[\w]+/g, '').trim();
  return { main, tags: tags.join(' ') };
}

// Collage options logic
export function getCollageOptions(count) {
  if (count === 3) {
    return [
      { value: 'side-by-side', label: 'Side by Side' },
      { value: 'vertical', label: 'Vertical Stack' },
      { value: 'grid', label: 'Grid' },
    ];
  }
  return [
    { value: 'side-by-side', label: 'Side by Side' },
    { value: 'vertical', label: 'Vertical Stack' },
  ];
} 
import React from 'react';

export default function MediaTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-4">
      {tags.map((tag) => (
        <span 
          key={tag} 
          className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-md shadow-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

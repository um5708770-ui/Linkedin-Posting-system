'use client';

import React, { useState } from 'react';
import { Hash, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

interface Step3Props {
  postText: string;
  seoTags: string[];
  setSeoTags: (tags: string[]) => void;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3SeoPrompt({
  seoTags,
  setSeoTags,
  onNext,
  onBack,
}: Step3Props) {
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!seoTags.includes(formatted)) {
      setSeoTags([...seoTags, formatted]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSeoTags(seoTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Hash className="w-4 h-4" /> Step 3: Manual SEO & LinkedIn Hashtags
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Custom LinkedIn Hashtags (Optional)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manually add custom hashtags or keywords for your post. (Zero AI API requests used here).
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* SEO Hashtags Editor */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" /> SEO / LinkedIn Hashtags ({seoTags.length})
            </label>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-2">
            {seoTags.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No hashtags added yet. Add custom hashtags below or click Next to proceed.
              </p>
            ) : (
              seoTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium flex items-center gap-2 group"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-400/60 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add Custom Tag Form */}
          <form onSubmit={handleAddTag} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Add custom hashtag (e.g. #PodcastGrowth)..."
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Post Draft</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <span>Next: Generate Visual Prompt & Artwork</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

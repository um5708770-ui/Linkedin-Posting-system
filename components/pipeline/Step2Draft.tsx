'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, AlertCircle, Eye } from 'lucide-react';

interface Step2Props {
  selectedIdea: { title: string; description: string };
  postText: string;
  setPostText: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Draft({
  selectedIdea,
  postText,
  setPostText,
  onNext,
  onBack,
}: Step2Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const generateDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle: selectedIdea.title,
          ideaDescription: selectedIdea.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to draft post');
        return;
      }

      if (data.postText) {
        setPostText(data.postText);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while writing post.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postText) {
      generateDraft();
    }
  }, [selectedIdea]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Edit3 className="w-4 h-4" /> Step 2: Post Drafting
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Write & Refine LinkedIn Post
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Generated using your brand voice and selected idea: <span className="text-blue-300 font-medium">"{selectedIdea.title}"</span>
          </p>
        </div>

        <button
          onClick={generateDraft}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Regenerate Draft</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mobile Segmented Toggle (lg:hidden) */}
      <div className="lg:hidden flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'editor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Copy</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'preview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Feed Preview</span>
        </button>
      </div>

      {/* Editor & Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Text Area Editor */}
        <div className={`lg:col-span-7 space-y-2 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Editable Post Copy
            </label>
            <span className="text-[11px] text-slate-400">
              {postText.length} characters • {postText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {loading ? (
            <div className="glass-panel h-[420px] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-white">Writing post in your voice...</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Applying brand voice rules and structuring high-converting LinkedIn hooks.
              </p>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Post copy will appear here..."
                rows={16}
                className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-100 text-sm leading-relaxed resize-none font-mono"
              />
            </div>
          )}
        </div>

        {/* Live LinkedIn Card Preview */}
        <div className={`lg:col-span-5 space-y-2 ${mobileView === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            LinkedIn Feed Preview
          </label>
          <div className="glass-card rounded-2xl p-5 border border-slate-700/60 space-y-4">
            {/* Mock User Bar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
                PG
              </div>
              <div>
                <p className="text-sm font-bold text-white">Podcast Growth Partner</p>
                <p className="text-[11px] text-slate-400">Scaling B2B Podcasts • 1h • 🌐</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-80 overflow-y-auto pr-1">
              {postText || <span className="text-slate-500 italic">Post content preview...</span>}
            </div>

            {/* Mock Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>🔄 Repost</span>
              <span>↗️ Send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ideas</span>
        </button>

        <button
          onClick={onNext}
          disabled={!postText.trim() || loading}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve Post & Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

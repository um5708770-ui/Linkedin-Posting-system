'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lightbulb, RefreshCw, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Idea {
  title: string;
  description: string;
}

interface Step1Props {
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  onNext: () => void;
  setIdeas: (ideas: Idea[]) => void;
}

export default function Step1Ideas({
  ideas,
  selectedIdea,
  onSelectIdea,
  onNext,
  setIdeas,
}: Step1Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMissingKey, setIsMissingKey] = useState(false);

  const fetchIdeas = async () => {
    setLoading(true);
    setError('');
    setIsMissingKey(false);

    try {
      const res = await fetch('/api/ai/ideas', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to generate ideas');
        if (data.isMissingKey) setIsMissingKey(true);
        return;
      }

      if (data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while generating ideas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Step 1: Idea Discovery
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Generate Podcast Growth Content Ideas
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Click below to generate 5-8 tailored LinkedIn post concepts based on your customizable prompt.
          </p>
        </div>

        <button
          onClick={fetchIdeas}
          disabled={loading}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 whitespace-nowrap transition-all"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Ideas...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{ideas.length > 0 ? 'Regenerate Batch' : 'Generate Ideas'}</span>
            </>
          )}
        </button>
      </div>

      {/* Missing Key / Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Generation Failed</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
          </div>
          {isMissingKey && (
            <Link
              href="/settings"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shrink-0"
            >
              Open Settings
            </Link>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-card p-5 rounded-2xl animate-pulse space-y-3">
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded w-full" />
              <div className="h-4 bg-slate-800/40 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && ideas.length === 0 && !error && (
        <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No ideas generated yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Ready to brainstorm? Click "Generate Ideas" to create podcast growth concepts using your custom system prompt.
          </p>
          <button
            onClick={fetchIdeas}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate 6 Fresh Ideas</span>
          </button>
        </div>
      )}

      {/* Idea Cards Grid */}
      {!loading && ideas.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, idx) => {
              const isSelected = selectedIdea?.title === idea.title;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectIdea(idea)}
                  className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-blue-500 bg-blue-950/30 shadow-xl shadow-blue-600/10'
                      : 'hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                        {idea.title}
                      </h3>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300/90 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              {selectedIdea ? `Selected: "${selectedIdea.title}"` : 'Click an idea card above to select it.'}
            </p>
            <button
              onClick={onNext}
              disabled={!selectedIdea}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <span>Write Post Draft</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

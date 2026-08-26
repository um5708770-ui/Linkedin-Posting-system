'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BookmarkCheck, ArrowRight, ArrowLeft, CheckCircle2, Copy, Download, Sparkles, FileText, RotateCcw } from 'lucide-react';

import { downloadImageFile } from '@/lib/download-image';

interface Step5Props {
  ideaTitle: string;
  ideaDescription: string;
  postText: string;
  seoTags: string[];
  imagePrompt: string;
  selectedImage: string | null;
  imageOptions: string[];
  savedPostId: string | null;
  setSavedPostId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onResetPipeline: () => void;
}

export default function Step5SaveDraft({
  ideaTitle,
  ideaDescription,
  postText,
  seoTags,
  imagePrompt,
  selectedImage,
  imageOptions,
  savedPostId,
  setSavedPostId,
  onNext,
  onBack,
  onResetPipeline,
}: Step5Props) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullPostTextWithTags = `${postText.trim()}\n\n${seoTags.join(' ')}`;

  const handleSaveDraft = async (shouldScheduleNext: boolean) => {
    setSaving(true);
    try {
      if (savedPostId) {
        // Update existing saved post
        await fetch(`/api/posts/${savedPostId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'draft',
            postText: fullPostTextWithTags,
            seoTags,
            imageUrl: selectedImage,
          }),
        });
      } else {
        // Create new post record
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'draft',
            ideaTitle,
            ideaDescription,
            postText: fullPostTextWithTags,
            seoTags,
            imagePrompt,
            imageUrl: selectedImage,
            imageOptions,
          }),
        });

        const data = await res.json();
        if (data.id) {
          setSavedPostId(data.id);
        }
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#34d399'],
      });

      if (shouldScheduleNext) {
        onNext();
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullPostTextWithTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    downloadImageFile(selectedImage, `linkedin-graphic-${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" /> Step 5: Save as Complete Draft
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Review & Save Post Record
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Your post text, SEO hashtags, and graphic variation are ready to be stored in your drafts library.
          </p>
        </div>

        {savedPostId && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Saved in Database (Draft)
          </div>
        )}
      </div>

      {/* Summary Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Post Copy View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Final Post Copy + SEO Tags
              </h3>
              <button
                onClick={handleCopyText}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-600/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <div className="w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="p-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
                {fullPostTextWithTags}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Graphic Thumbnail View */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Approved Graphic Visual
              </h3>
              {selectedImage && (
                <button
                  onClick={handleDownloadImage}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-600/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>
            {selectedImage ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                <img src={selectedImage} alt="Selected Graphic" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                No graphic selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Image Selection</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleSaveDraft(false)}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>Save Draft</span>
          </button>

          <button
            onClick={async () => {
              await handleSaveDraft(false);
              onResetPipeline();
            }}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save & Start New Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

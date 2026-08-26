'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trash2,
  FileImage,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface Step4Props {
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  ideaTitle: string;
  postText: string;
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
  imageOptions?: string[];
  setImageOptions?: (options: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Images({
  imagePrompt,
  setImagePrompt,
  postText,
  selectedImage,
  setSelectedImage,
  onNext,
  onBack,
}: Step4Props) {
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const generateVisualPrompt = async () => {
    setLoadingPrompt(true);
    setPromptError('');

    try {
      const res = await fetch('/api/ai/seo-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromptError(data.error || 'Failed to generate visual graphic prompt');
        return;
      }

      if (data.imagePrompt) {
        setImagePrompt(data.imagePrompt);
      }
    } catch (err: any) {
      setPromptError(err?.message || 'Network error while generating visual prompt.');
    } finally {
      setLoadingPrompt(false);
    }
  };

  useEffect(() => {
    if (!imagePrompt && postText) {
      generateVisualPrompt();
    }
  }, [postText]);

  const handleCopyPrompt = () => {
    if (!imagePrompt) return;
    navigator.clipboard.writeText(imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" /> Step 4: AI Visual Concept & Graphic Upload
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Generate Visual Prompt & Upload Artwork
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            AI designs a custom visual prompt for your post copy. Copy the prompt to Midjourney, ChatGPT, or Flux, and upload your generated graphic here.
          </p>
        </div>

        <button
          type="button"
          onClick={generateVisualPrompt}
          disabled={loadingPrompt}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all shrink-0"
        >
          {loadingPrompt ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 text-blue-400" />
          )}
          <span>Regenerate Visual Prompt</span>
        </button>
      </div>

      {promptError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{promptError}</span>
        </div>
      )}

      {/* Main Content Grid: Copy Prompt (Left/Top) & Upload Image (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Prompt Copy Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> AI Visual Graphic Prompt
                </h3>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  disabled={!imagePrompt || loadingPrompt}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 font-semibold flex items-center gap-1.5 bg-blue-600/10 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>

              {loadingPrompt ? (
                <div className="p-8 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-center space-y-2 border border-slate-800 min-h-[160px]">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-300">AI is analyzing post copy & composing visual concept...</p>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={5}
                    placeholder="AI visual prompt description..."
                    className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs text-slate-200 leading-relaxed font-mono resize-y min-h-[160px]"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Copy this prompt into Midjourney, DALL-E 3, Flux, or Leonardo AI to generate your post graphic.</span>
            </div>
          </div>
        </div>

        {/* Image Upload Zone & Preview Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between h-full">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" /> Upload Generated Graphic Artwork
            </h3>

            {selectedImage ? (
              /* Uploaded Image Preview */
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group">
                <img src={selectedImage} alt="Uploaded Artwork" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg">
                    <Upload className="w-3.5 h-3.5" /> Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Image Attached
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  <FileImage className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white mb-1">
                  Drag & Drop your generated graphic here
                </p>
                <p className="text-[11px] text-slate-400 mb-4">
                  Supports PNG, JPG, WebP formats
                </p>
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-lg shadow-blue-600/30 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Browse Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SEO Hashtags</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <span>Next: Save Draft</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

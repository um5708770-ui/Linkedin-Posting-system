'use client';

import React, { useState, useEffect } from 'react';
import Stepper from '@/components/pipeline/Stepper';
import Step1Ideas from '@/components/pipeline/Step1Ideas';
import Step2Draft from '@/components/pipeline/Step2Draft';
import Step3SeoPrompt from '@/components/pipeline/Step3SeoPrompt';
import Step4Images from '@/components/pipeline/Step4Images';
import Step5SaveDraft from '@/components/pipeline/Step5SaveDraft';

const LOCAL_STORAGE_KEY = 'linkedin_studio_active_pipeline_v1';

export default function DashboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  // Pipeline Data State
  const [ideas, setIdeas] = useState<{ title: string; description: string }[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<{ title: string; description: string } | null>(null);
  const [postText, setPostText] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savedPostId, setSavedPostId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved session state on mount (from localStorage first, then sync DB for cross-device)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.maxReachedStep) setMaxReachedStep(parsed.maxReachedStep);
        if (parsed.ideas?.length) setIdeas(parsed.ideas);
        if (parsed.selectedIdea) setSelectedIdea(parsed.selectedIdea);
        if (parsed.postText) setPostText(parsed.postText);
        if (parsed.seoTags?.length) setSeoTags(parsed.seoTags);
        if (parsed.imagePrompt) setImagePrompt(parsed.imagePrompt);
        if (parsed.imageOptions?.length) setImageOptions(parsed.imageOptions);
        if (parsed.selectedImage) setSelectedImage(parsed.selectedImage);
        if (parsed.savedPostId) setSavedPostId(parsed.savedPostId);
      }
    } catch (e) {
      console.warn('Failed to parse local pipeline cache:', e);
    } finally {
      setIsLoaded(true);
    }

    // Cross-device sync: fetch latest active pipeline session from database
    fetch('/api/settings')
      .then((res) => res.json())
      .then((settings) => {
        if (settings && settings.active_pipeline_session) {
          try {
            const dbSession = JSON.parse(settings.active_pipeline_session);
            if (dbSession && dbSession.selectedIdea) {
              setCurrentStep((prev) => Math.max(prev, dbSession.currentStep || 1));
              setMaxReachedStep((prev) => Math.max(prev, dbSession.maxReachedStep || 1));
              if (dbSession.ideas?.length) setIdeas(dbSession.ideas);
              if (dbSession.selectedIdea) setSelectedIdea(dbSession.selectedIdea);
              if (dbSession.postText) setPostText(dbSession.postText);
              if (dbSession.seoTags?.length) setSeoTags(dbSession.seoTags);
              if (dbSession.imagePrompt) setImagePrompt(dbSession.imagePrompt);
              if (dbSession.imageOptions?.length) setImageOptions(dbSession.imageOptions);
              if (dbSession.selectedImage) setSelectedImage(dbSession.selectedImage);
              if (dbSession.savedPostId) setSavedPostId(dbSession.savedPostId);
            }
          } catch (err) {}
        }
      })
      .catch(() => {});
  }, []);

  // Save session state to localStorage & DB whenever state updates
  useEffect(() => {
    if (!isLoaded) return;

    const sessionState = {
      currentStep,
      maxReachedStep,
      ideas,
      selectedIdea,
      postText,
      seoTags,
      imagePrompt,
      imageOptions,
      selectedImage,
      savedPostId,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionState));
    } catch (e) {}

    // Debounced DB save for cross-device sync
    const timer = setTimeout(() => {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_pipeline_session: JSON.stringify(sessionState),
        }),
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    maxReachedStep,
    ideas,
    selectedIdea,
    postText,
    seoTags,
    imagePrompt,
    imageOptions,
    selectedImage,
    savedPostId,
    isLoaded,
  ]);

  const goToStep = (stepNumber: number) => {
    if (stepNumber <= maxReachedStep) {
      setCurrentStep(stepNumber);
    }
  };

  const advanceToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    if (stepNumber > maxReachedStep) {
      setMaxReachedStep(stepNumber);
    }
  };

  const handleResetPipeline = () => {
    setCurrentStep(1);
    setMaxReachedStep(1);
    setIdeas([]);
    setSelectedIdea(null);
    setPostText('');
    setSeoTags([]);
    setImagePrompt('');
    setImageOptions([]);
    setSelectedImage(null);
    setSavedPostId(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_pipeline_session: '' }),
    }).catch(() => {});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            LinkedIn Content Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Human-approved content creation workflow — idea to post draft.
          </p>
        </div>
        {selectedIdea && (
          <button
            onClick={handleResetPipeline}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            + Start New Post
          </button>
        )}
      </div>

      {/* Stepper Bar */}
      <Stepper
        currentStep={currentStep}
        onStepClick={goToStep}
        maxReachedStep={maxReachedStep}
      />

      {/* Guided Step Panels */}
      {currentStep === 1 && (
        <Step1Ideas
          ideas={ideas}
          setIdeas={setIdeas}
          selectedIdea={selectedIdea}
          onSelectIdea={(idea) => setSelectedIdea(idea)}
          onNext={() => advanceToStep(2)}
        />
      )}

      {currentStep === 2 && selectedIdea && (
        <Step2Draft
          selectedIdea={selectedIdea}
          postText={postText}
          setPostText={setPostText}
          onNext={() => advanceToStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3SeoPrompt
          postText={postText}
          seoTags={seoTags}
          setSeoTags={setSeoTags}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          onNext={() => advanceToStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4Images
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          ideaTitle={selectedIdea?.title || ''}
          postText={postText}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          imageOptions={imageOptions}
          setImageOptions={setImageOptions}
          onNext={() => advanceToStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step5SaveDraft
          ideaTitle={selectedIdea?.title || ''}
          ideaDescription={selectedIdea?.description || ''}
          postText={postText}
          seoTags={seoTags}
          imagePrompt={imagePrompt}
          selectedImage={selectedImage}
          imageOptions={imageOptions}
          savedPostId={savedPostId}
          setSavedPostId={setSavedPostId}
          onNext={() => {}}
          onBack={() => setCurrentStep(4)}
          onResetPipeline={handleResetPipeline}
        />
      )}
    </div>
  );
}

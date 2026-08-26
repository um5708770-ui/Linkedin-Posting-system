'use client';

import React, { useState } from 'react';
import Stepper from '@/components/pipeline/Stepper';
import Step1Ideas from '@/components/pipeline/Step1Ideas';
import Step2Draft from '@/components/pipeline/Step2Draft';
import Step3SeoPrompt from '@/components/pipeline/Step3SeoPrompt';
import Step4Images from '@/components/pipeline/Step4Images';
import Step5SaveDraft from '@/components/pipeline/Step5SaveDraft';

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
    setSelectedIdea(null);
    setPostText('');
    setSeoTags([]);
    setImagePrompt('');
    setImageOptions([]);
    setSelectedImage(null);
    setSavedPostId(null);
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

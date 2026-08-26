'use client';

import React from 'react';
import { Lightbulb, Edit3, Hash, Image as ImageIcon, BookmarkCheck } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxReachedStep: number;
}

export default function Stepper({ currentStep, onStepClick, maxReachedStep }: StepperProps) {
  const steps = [
    { number: 1, label: 'Ideas', icon: Lightbulb },
    { number: 2, label: 'Post Draft', icon: Edit3 },
    { number: 3, label: 'SEO Tags', icon: Hash },
    { number: 4, label: 'Artwork Upload', icon: ImageIcon },
    { number: 5, label: 'Save Draft', icon: BookmarkCheck },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-between overflow-x-auto md:overflow-x-visible gap-2 scrollbar-none">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isAccessible = step.number <= maxReachedStep;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => isAccessible && onStepClick(step.number)}
                disabled={!isAccessible}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : isCompleted
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800/50 hover:bg-blue-900/60'
                    : isAccessible
                    ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-950/30 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 min-w-4 flex-1 rounded-full hidden sm:block ${
                    step.number < currentStep ? 'bg-blue-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

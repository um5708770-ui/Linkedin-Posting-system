'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function IntroSplash({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<
    'start' | 'brand_in' | 'line_center' | 'line_fullscreen' | 'slide_up' | 'done'
  >('start');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Lock body scroll during splash screen to prevent screen size fluctuations / scrollbar shifts
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 0.1s: Logo & Title fade/scale in smoothly
    const t0 = setTimeout(() => {
      setStage('brand_in');
    }, 100);

    // 0.45s: Line starts expanding under title
    const t1 = setTimeout(() => {
      setStage('line_center');
    }, 450);

    // 1.8s: Line smoothly glides to 100% full-screen width
    const t2 = setTimeout(() => {
      setStage('line_fullscreen');
    }, 1800);

    // 2.2s: Entire curtain frame slides UP off-screen
    const t3 = setTimeout(() => {
      setStage('slide_up');
    }, 2200);

    // 3.2s: Unmount intro splash cleanly
    const t4 = setTimeout(() => {
      setStage('done');
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      window.removeEventListener('resize', checkMobile);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  const isSlideUp = stage === 'slide_up';

  const getLineWidth = () => {
    if (stage === 'start' || stage === 'brand_in') return '0%';
    if (stage === 'line_center') return isMobile ? '85%' : '700px';
    return '100%';
  };

  const getLineTransition = () => {
    if (stage === 'line_center') return 'width 1000ms cubic-bezier(0.25, 1, 0.5, 1)';
    if (stage === 'line_fullscreen' || stage === 'slide_up') return 'width 800ms cubic-bezier(0.25, 1, 0.5, 1)';
    return 'width 600ms ease';
  };


  return (
    <div
      className="fixed inset-0 z-[100] w-full h-full bg-[#070a12] flex flex-col items-center justify-between shadow-2xl border-b border-blue-500/30 overflow-hidden select-none transform-gpu"
      style={{
        transform: isSlideUp ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
        transition: 'transform 850ms cubic-bezier(0.77, 0, 0.175, 1)',
        willChange: 'transform',
      }}
    >

      {/* Background Ambient Glowing Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[850px] sm:h-[850px] bg-blue-600/15 rounded-full blur-[120px] sm:blur-[180px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[480px] sm:h-[480px] bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
      </div>

      <div className="flex-1" />

      {/* Main Center SaaS Content Container */}
      <div className="flex flex-col items-center justify-center text-center px-4 z-10 w-full relative">
        {/* 1. Animated SaaS Brand Logo Badge */}
        <div
          className="relative mb-5 sm:mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: stage === 'start' ? 0 : 1,
            transform: stage === 'start' ? 'scale(0.75) translateY(20px)' : 'scale(1) translateY(0)',
          }}
        >
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 opacity-70 blur-lg animate-pulse" />
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-3xl bg-slate-900 border border-blue-500/50 overflow-hidden shadow-2xl shadow-blue-500/50 p-1.5">
            <img
              src="/logo.jpeg"
              alt="LinkedIn Content Studio Logo"
              className="w-full h-full object-cover rounded-2xl scale-[1.35] transform object-center"
            />
          </div>
        </div>

        {/* 2. Animated SaaS Title & Subtitle */}
        <div
          className="space-y-2 sm:space-y-2.5 transition-all duration-700 ease-out mb-4"
          style={{
            opacity: stage === 'start' ? 0 : 1,
            transform: stage === 'start' ? 'translateY(25px)' : 'translateY(0)',
            transitionDelay: '120ms',
          }}
        >
          <div className="flex items-center justify-center">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> LinkedIn Content Studio
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 font-retro-floral" style={{ letterSpacing: '0.08em' }}>
            Podcast Growth Partner
          </h1>
        </div>

        {/* 3. Responsive Edge-to-Edge Horizon Line */}
        <div className="absolute left-0 right-0 w-full flex items-center justify-center bottom-0 translate-y-2 overflow-visible">
          <div
            className="h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(56,189,248,0.95)] rounded-full"
            style={{
              width: getLineWidth(),
              transition: getLineTransition(),
              willChange: 'width',
            }}
          />
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}

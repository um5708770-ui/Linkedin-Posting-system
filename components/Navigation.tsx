'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Settings,
  Radio,
  Zap,
} from 'lucide-react';

import IntroSplash from './IntroSplash';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Studio Pipeline', icon: Sparkles },
    { href: '/drafts', label: 'Drafts', icon: FileText },
    { href: '/published', label: 'Published', icon: CheckCircle2 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19] text-slate-100">
      {/* 3-4s Intro Animation on Site Load */}
      <IntroSplash />

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl p-4 sticky top-0 h-screen z-30 justify-between">
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
            <div className="h-12 w-12 rounded-xl border border-blue-500/40 overflow-hidden shadow-lg shadow-blue-500/25 shrink-0 bg-slate-900 p-0.5">
              <img src="/logo.jpeg" alt="LinkedIn Studio Logo" className="w-full h-full object-cover rounded-lg scale-[1.3] transform object-center" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight tracking-tight">
                LinkedIn Studio
              </h1>
              <p className="text-xs text-blue-400 font-medium">Podcast Growth Partner</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Direct Access Footer */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                PGP
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">Personal Brand</p>
                <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Direct Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl border border-blue-500/40 overflow-hidden shrink-0 bg-slate-900 p-0.5">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg scale-[1.3] transform object-center" />
          </div>
          <div>
            <h1 className="font-bold text-xs sm:text-sm text-white leading-tight">
              LinkedIn Studio
            </h1>
            <p className="text-[10px] text-blue-400 font-medium font-brand leading-tight">
              Podcast Growth Partner
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
        </div>
      </header>


      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 py-2 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                isActive ? 'text-blue-500 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

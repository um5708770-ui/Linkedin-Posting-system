'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Key, Sparkles, Database, Download, Upload, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Bell, BellRing, BellOff, Send } from 'lucide-react';
import { DEFAULT_PROMPTS } from '@/lib/default-prompts';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3.5-flash', 'gemini-3.6-flash']);
  const [ideasPrompt, setIdeasPrompt] = useState('');
  const [postPrompt, setPostPrompt] = useState('');
  const [seoImagePrompt, setSeoImagePrompt] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState('true');
  const [reminderTime, setReminderTime] = useState('20:00');

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Data Management state
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const [restoreMessage, setRestoreMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Daily Push Reminder state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [testingPush, setTestingPush] = useState(false);

  const checkPushSubscriptionStatus = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setPushSubscribed(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };


  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data) {
        setApiKey(data.gemini_api_key || '');
        if (data.selected_models) {
          const parsed = data.selected_models.split(/[\n\r,;]+/).map((m: string) => m.trim()).filter((m: string) => m === 'gemini-3.5-flash' || m === 'gemini-3.6-flash');
          setSelectedModels(parsed.length > 0 ? parsed : ['gemini-3.5-flash', 'gemini-3.6-flash']);
        }
        setIdeasPrompt(data.ideas_prompt || DEFAULT_PROMPTS.ideas_prompt);
        setPostPrompt(data.post_prompt || DEFAULT_PROMPTS.post_prompt);
        setSeoImagePrompt(data.seo_image_prompt || DEFAULT_PROMPTS.seo_image_prompt);
        setBrandVoice(data.brand_voice || DEFAULT_PROMPTS.brand_voice);
        setReminderEnabled(data.reminder_enabled !== undefined ? data.reminder_enabled : 'true');
        setReminderTime(data.reminder_time || '20:00');
      }


      // Also fetch post count stats
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      if (Array.isArray(postsData)) {
        setPostsCount(postsData.length);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    checkPushSubscriptionStatus();
  }, []);


  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: apiKey,
          selected_models: selectedModels.join(','),
          ideas_prompt: ideasPrompt,
          post_prompt: postPrompt,
          seo_image_prompt: seoImagePrompt,
          brand_voice: brandVoice,
          reminder_enabled: reminderEnabled,
          reminder_time: reminderTime,
        }),
      });


      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleModelSelection = (modelName: string) => {
    if (selectedModels.includes(modelName)) {
      if (selectedModels.length === 1) return; // Keep at least 1 model selected
      setSelectedModels(selectedModels.filter((m) => m !== modelName));
    } else {
      setSelectedModels([...selectedModels, modelName]);
    }
  };

  const handleResetSingle = async (key: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (data.value !== undefined) {
        if (key === 'gemini_api_key') setApiKey(data.value);
        if (key === 'ideas_prompt') setIdeasPrompt(data.value);
        if (key === 'post_prompt') setPostPrompt(data.value);
        if (key === 'seo_image_prompt') setSeoImagePrompt(data.value);
        if (key === 'brand_voice') setBrandVoice(data.value);
      }
    } catch (err) {
      console.error(`Failed to reset ${key}:`, err);
    }
  };

  // Data Export
  const handleExportJSON = () => {
    window.location.href = '/api/data-management';
  };

  // Data Import
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreMessage('Reading backup file...');
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const res = await fetch('/api/data-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });

      const data = await res.json();
      if (res.ok) {
        setRestoreMessage(data.message || 'Restored successfully!');
        fetchSettings();
      } else {
        setRestoreMessage(`Error: ${data.error || 'Import failed'}`);
      }
    } catch (err: any) {
      setRestoreMessage(`Invalid JSON file: ${err?.message}`);
    }
  };

  // Delete All Data
  const handleDeleteAllData = async () => {
    if (deleteConfirmationInput !== 'DELETE') return;

    setDeleting(true);
    try {
      const res = await fetch('/api/data-management', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowDeleteModal(false);
        setDeleteConfirmationInput('');
        fetchSettings();
      } else {
        alert(data.error || 'Failed to delete data');
      }
    } catch (err: any) {
      alert(`Error: ${err?.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Push Notification handlers
  const handleSubscribePush = async () => {
    setPushLoading(true);
    setPushMessage('');
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushMessage('Push notifications are not supported on this browser.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushMessage('Notification permission was denied. Please enable notifications in browser settings.');
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const res = await fetch('/api/notifications/subscribe');
      const data = await res.json();
      const publicKey = data.publicKey;

      if (!publicKey) {
        setPushMessage('Failed to retrieve VAPID public key.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const saveRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });

      if (saveRes.ok) {
        setPushSubscribed(true);
        setPushMessage('Successfully subscribed to Daily 8 PM Reminders! You will get native notifications on your mobile/desktop panel.');
      } else {
        const errData = await saveRes.json();
        setPushMessage(`Error: ${errData.error || 'Failed to save subscription'}`);
      }
    } catch (err: any) {
      setPushMessage(`Error: ${err?.message || 'Failed to subscribe'}`);
    } finally {
      setPushLoading(false);
    }
  };

  const handleUnsubscribePush = async () => {
    setPushLoading(true);
    setPushMessage('');
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/notifications/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setPushSubscribed(false);
      setPushMessage('Unsubscribed from Daily 8 PM Reminders.');
    } catch (err: any) {
      setPushMessage(`Error: ${err?.message || 'Failed to unsubscribe'}`);
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPushNotification = async () => {
    setTestingPush(true);
    setPushMessage('');
    try {
      // 1. Trigger local browser notification immediately if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('⚡ TEST: Live Browser Notification', {
            body: 'Success! Notification panel module is working perfectly on this device.',
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Trigger Vercel Web Push API test
      const res = await fetch('/api/cron/reminder?test=true', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPushMessage(
          data.message || `Test notification sent! (${data.sent} device(s) notified)`
        );
      } else {
        setPushMessage(`Error: ${data.error || 'Failed to send test notification'}`);
      }
    } catch (err: any) {
      setPushMessage(`Error: ${err?.message || 'Failed to send test notification'}`);
    } finally {
      setTestingPush(false);
    }
  };


  return (

    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Settings & AI Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize AI system prompts, API credentials, brand voice, and data backups in real-time.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save All Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Settings saved successfully! Changes take effect on your next AI generation.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-card h-96 rounded-2xl p-8 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-8">
          {/* Section 1: Gemini API Keys Pool & Model Rotation */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                  <Key className="w-4 h-4 text-blue-400 shrink-0" /> 1. Gemini API Keys & Models
                </h2>
                {apiKey.trim() && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold whitespace-nowrap">
                    {apiKey.split(/[\n\r,;]+/).filter((k) => k.trim().length > 0).length} Key(s) In Pool
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleResetSingle('gemini_api_key')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0 ml-auto sm:ml-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Add one or multiple Gemini API keys (one key per line or comma-separated). The system will automatically rotate requests across your API keys and cycle between <span className="text-blue-400 font-semibold font-mono">Gemini 3.5</span> and <span className="text-blue-400 font-semibold font-mono">Gemini 3.6</span> models round-robin with auto-failover.
            </p>

            <div className="relative rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <textarea
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                rows={3}
                placeholder="AIzaSy... (key 1)&#10;AIzaSy... (key 2)"
                style={{ WebkitTextSecurity: showApiKey ? 'none' : 'disc' } as React.CSSProperties}
                className="w-full p-3.5 pr-10 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white text-xs font-mono leading-relaxed"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-200"
                title={showApiKey ? 'Hide Keys' : 'Show Keys'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Model Selection Options */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Select Gemini Models for Revolving System
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', badge: 'Ultra-Fast & Smart' },
                  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', badge: 'Next-Gen High Throughput' },
                ].map((mod) => {
                  const isSelected = selectedModels.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModelSelection(mod.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </div>
                        <div>
                          <p className={`text-xs font-bold font-mono whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {mod.label}
                          </p>
                          <p className="text-[10px] text-slate-400 whitespace-nowrap">{mod.badge}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 whitespace-nowrap ${
                          isSelected ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {mod.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">
                Active Revolving Loop Sequence:{' '}
                <code className="text-blue-300 font-mono">
                  (Key 1, {selectedModels[0] || '3.5'}) ➔ (Key 1, {selectedModels[1] || selectedModels[0] || '3.6'})...
                </code>
              </span>
            </div>
          </div>

          {/* Section 2: Dedicated Brand Voice Field */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" /> 2. Brand Voice & Style
              </h2>
              <button
                type="button"
                onClick={() => handleResetSingle('brand_voice')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Describe your tone, favorite sentence structures, podcast growth expertise angle, and how you open/close posts. Injected into the Post Writing System Prompt automatically.
            </p>
            <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <textarea
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                rows={4}
                placeholder="Describe your tone, sentence style, favorite phrases, how you open/close posts..."
                className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-200 text-xs font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: Step 1 Ideas Generation System Prompt */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                3. Ideas Generation Prompt (Step 1)
              </h2>
              <button
                type="button"
                onClick={() => handleResetSingle('ideas_prompt')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <textarea
                value={ideasPrompt}
                onChange={(e) => setIdeasPrompt(e.target.value)}
                rows={5}
                className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-200 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Step 2 Post Writing System Prompt */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                4. Post Writing Prompt (Step 2)
              </h2>
              <button
                type="button"
                onClick={() => handleResetSingle('post_prompt')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Must include <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">{'{brand_voice}'}</code> and <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">{'{selected_idea}'}</code> placeholders.
            </p>
            <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <textarea
                value={postPrompt}
                onChange={(e) => setPostPrompt(e.target.value)}
                rows={6}
                className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-200 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Step 4 Visual Graphic Prompt System Prompt */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                5. Visual Concept Prompt (Step 4)
              </h2>
              <button
                type="button"
                onClick={() => handleResetSingle('seo_image_prompt')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <p className="text-xs text-slate-400">
              System prompt used by AI to analyze your post copy and design a detailed visual graphic prompt. Must include <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">{'{post_text}'}</code> placeholder.
            </p>
            <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <textarea
                value={seoImagePrompt}
                onChange={(e) => setSeoImagePrompt(e.target.value)}
                rows={6}
                className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-200 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Section 6: Data Management (Export, Import, Delete) */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" /> 6. Data Management & Storage
            </h2>

            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <p className="font-semibold text-slate-200">Database Storage Overview</p>
                <p className="text-slate-400 mt-0.5">
                  Total Posts Stored: <span className="text-blue-400 font-bold">{postsCount ?? 0}</span>
                </p>
              </div>
            </div>

            {/* Export & Import Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-400">Export / Backup Data</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Download posts & settings as single JSON</p>
                </div>
                <Download className="w-4 h-4 text-blue-400" />
              </button>

              <label className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center justify-between group cursor-pointer transition-all">
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-400">Import / Restore Data</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Restore database from backup JSON</p>
                </div>
                <Upload className="w-4 h-4 text-blue-400" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {restoreMessage && (
              <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 font-mono border border-slate-800">
                {restoreMessage}
              </div>
            )}

            {/* Destructive Delete All Data Section */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-400">Delete All Data</p>
                <p className="text-[11px] text-slate-400">Permanently delete all post records in the workspace.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Data
              </button>
            </div>
          </div>

          {/* Section 7: Daily Push Notification Reminders with Time & Start/Stop Controls */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" /> 7. Daily Reminder Notification Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure daily posting time, start/stop automated reminders, and test mobile alerts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    reminderEnabled === 'true'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {reminderEnabled === 'true' ? (
                    <>
                      <BellRing className="w-3.5 h-3.5 text-emerald-400" /> Reminders Running ({reminderTime} PKT)
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3.5 h-3.5 text-rose-400" /> Reminders Stopped
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Start / Stop Toggle & Time Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              {/* Option A: Start/Stop Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Automated Reminder Status
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(reminderEnabled === 'true' ? 'false' : 'true')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      reminderEnabled === 'true'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                        : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {reminderEnabled === 'true' ? (
                      <>
                        <BellRing className="w-4 h-4" /> Reminders Started (Active)
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4" /> Reminders Stopped (Paused)
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {reminderEnabled === 'true'
                    ? 'Automated cron will send daily push reminders at your selected time.'
                    : 'All automated reminder notifications are currently paused/stopped.'}
                </p>
              </div>

              {/* Option B: Reminder Time Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Daily Reminder Time (PKT)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {['18:00', '19:00', '20:00', '21:00', '22:00'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReminderTime(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          reminderTime === preset
                            ? 'bg-blue-600 text-white border border-blue-400'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Selected Time:{' '}
                  <span className="text-blue-400 font-bold font-mono">
                    {reminderTime} PKT
                  </span>
                </p>
              </div>
            </div>

            {/* Device Subscription & Instant Test Notification Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {!pushSubscribed ? (
                  <button
                    type="button"
                    onClick={handleSubscribePush}
                    disabled={pushLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                  >
                    {pushLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>Subscribe This Device</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleUnsubscribePush}
                    disabled={pushLoading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                  >
                    {pushLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    <span>Unsubscribe Device</span>
                  </button>
                )}

                {/* Instant Test Notification Button */}
                <button
                  type="button"
                  onClick={handleTestPushNotification}
                  disabled={testingPush}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  {testingPush ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>⚡ Instant Test Notification</span>
                </button>
              </div>
            </div>

            {pushMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-mono border ${
                  pushMessage.startsWith('Error') || pushMessage.includes('denied') || pushMessage.includes('Failed')
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {pushMessage}
              </div>
            )}
          </div>



          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Delete All Data Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertCircle className="w-5 h-5" /> Confirm Destructive Deletion
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action cannot be undone. All stored post ideas, drafts, scheduled, and published records will be permanently erased.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Type <span className="text-white font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationInput('');
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={deleteConfirmationInput !== 'DELETE' || deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

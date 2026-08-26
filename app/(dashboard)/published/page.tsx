'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Edit3,
  Upload,
  X,
  Save,
  Clock,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { downloadImageFile } from '@/lib/download-image';

interface Post {
  id: string;
  status: string;
  ideaTitle: string | null;
  ideaDescription: string | null;
  postText: string | null;
  seoTags: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PublishedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPublished = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?status=published');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching published posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublished();
  }, []);

  // 1-Click Copy All (Title + Full Post Copy)
  const handleCopyAll = (post: Post) => {
    const title = post.ideaTitle?.trim() || '';
    const body = post.postText?.trim() || '';
    const combined = title ? `${title}\n\n${body}` : body;

    navigator.clipboard.writeText(combined);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download Full Resolution Artwork
  const handleDownloadImage = (imageUrl: string | null, id: string) => {
    downloadImageFile(imageUrl, `published-graphic-${id.substring(0, 6)}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.ideaTitle || '');
    setEditText(post.postText || '');
    setEditImage(post.imageUrl);
  };

  // Save Edit Changes
  const handleSaveEdit = async () => {
    if (!editingPost) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle: editTitle,
          postText: editText,
          imageUrl: editImage,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map((p) => (p.id === updated.id ? updated : p)));
        setEditingPost(null);
      }
    } catch (err) {
      console.error('Error saving post edit:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this published post?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting published post:', err);
    }
  };

  const handleImageFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Published Posts
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              {posts.length} / 10 Max Stock
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Logs your recent 10 published posts. Oldest 10th post is automatically recycled when new posts arrive.
          </p>
        </div>

        <Link
          href="/drafts"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>View Drafts Inventory</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-80 rounded-2xl p-5 animate-pulse space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-32 bg-slate-800/60 rounded" />
              <div className="h-8 bg-slate-800/40 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No published posts yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            When you click "Publish" on any post in Drafts, it will move here and store your recent 10 posts.
          </p>
          <Link
            href="/drafts"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Go to Drafts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card rounded-2xl p-5 border border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                {/* Top Badge & Published Date */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Published
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                  {post.ideaTitle || 'Untitled Post Concept'}
                </h3>

                {/* Content Preview Box with Internal Scroll */}
                <div className="w-full rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed font-sans p-3">
                    {post.postText}
                  </p>
                </div>

                {/* Image Graphic Thumbnail */}
                {post.imageUrl && (
                  <div className="relative group aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={post.imageUrl} alt="Artwork" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <button
                        onClick={() => handleDownloadImage(post.imageUrl, post.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-lg"
                      >
                        <Download className="w-3.5 h-3.5" /> Full Res
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyAll(post)}
                  className="flex-1 py-2 px-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  title="Copy Title + Full Post Text"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === post.id ? 'Copied All!' : 'Copy All'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(post)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Edit Post Copy & Image"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit</span>
                </button>

                {post.imageUrl && (
                  <button
                    onClick={() => handleDownloadImage(post.imageUrl, post.id)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl border border-slate-800 transition-colors"
                    title="Download Full Resolution Graphic"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 transition-colors ml-auto"
                  title="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="glass-panel w-full max-w-2xl rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" /> Edit Published Post
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Post Title / Hook Header
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Post Copy Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Post Copy
              </label>
              <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-blue-500">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={10}
                  className="w-full p-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-100 text-xs leading-relaxed font-mono resize-y"
                />
              </div>
            </div>

            {/* Image Preview & Replace */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Graphic Artwork
              </label>
              {editImage ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group">
                  <img src={editImage} alt="Artwork" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1 shadow-lg">
                      <Upload className="w-3.5 h-3.5" /> Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => handleDownloadImage(editImage, editingPost.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-lg"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full Res
                    </button>
                    <button
                      onClick={() => setEditImage(null)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center flex items-center justify-center gap-2 cursor-pointer bg-slate-900/60 text-slate-300 text-xs font-semibold">
                  <Upload className="w-4 h-4 text-blue-400" /> Upload Artwork Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5"
              >
                {savingEdit ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

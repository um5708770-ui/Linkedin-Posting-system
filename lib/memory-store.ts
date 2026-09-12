export interface MemoryEntry {
  id: string;
  text: string;
  theme: string;
  savedAt: string; // ISO timestamp
}

const STORAGE_PREFIX = 'linkedin_studio_memory_';
const LIMIT_KEY = 'linkedin_studio_memory_limit';
export const DEFAULT_LIMIT = 10;
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 200;
export const DEFAULT_CATEGORIES = ['general', 'tech', 'motivation', 'quran'] as const;

export function getMemoryLimit(): number {
  if (typeof window === 'undefined') return DEFAULT_LIMIT;
  try {
    const val = localStorage.getItem(LIMIT_KEY);
    if (!val) return DEFAULT_LIMIT;
    const limit = parseInt(val, 10);
    if (isNaN(limit)) return DEFAULT_LIMIT;
    return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit));
  } catch {
    return DEFAULT_LIMIT;
  }
}

export function setMemoryLimit(limit: number): void {
  if (typeof window === 'undefined') return;
  const clampedLimit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit));
  try {
    localStorage.setItem(LIMIT_KEY, clampedLimit.toString());

    // Safely snapshot all memory category keys first to prevent iteration issues
    const keysToTrim: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key !== LIMIT_KEY) {
        keysToTrim.push(key);
      }
    }

    // Also include default category keys if present
    for (const cat of DEFAULT_CATEGORIES) {
      const catKey = `${STORAGE_PREFIX}${cat}`;
      if (!keysToTrim.includes(catKey)) {
        keysToTrim.push(catKey);
      }
    }

    // Apply FIFO slice trimming to fit the new limit
    for (const key of keysToTrim) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const items = JSON.parse(raw) as MemoryEntry[];
          if (Array.isArray(items) && items.length > clampedLimit) {
            const trimmed = items.slice(0, clampedLimit);
            localStorage.setItem(key, JSON.stringify(trimmed));
          }
        } catch {
          // ignore parse errors for individual keys
        }
      }
    }
  } catch {
    // ignore storage exceptions
  }
}

export function getRecentMemory(category: string = 'general'): MemoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `${STORAGE_PREFIX}${category}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (Array.isArray(items)) {
      return items;
    }
    return [];
  } catch {
    return [];
  }
}

function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function addToRecentMemory(category: string = 'general', text: string, theme: string): MemoryEntry {
  const newEntry: MemoryEntry = {
    id: generateId(),
    text,
    theme,
    savedAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return newEntry;

  try {
    let items = getRecentMemory(category);
    // Prepend new entry (newest at index 0)
    items.unshift(newEntry);
    const limit = getMemoryLimit();
    // FIFO Ring Buffer: drop oldest entries exceeding limit
    if (items.length > limit) {
      items = items.slice(0, limit);
    }
    const key = `${STORAGE_PREFIX}${category}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}

  return newEntry;
}

export function deleteMemoryEntry(category: string = 'general', id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const items = getRecentMemory(category);
    const filtered = items.filter((item) => item.id !== id);
    const key = `${STORAGE_PREFIX}${category}`;
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
}

export function clearMemoryCategory(category: string = 'general'): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_PREFIX}${category}`;
    localStorage.removeItem(key);
  } catch {}
}

export function buildAntiRepeatBlock(category: string = 'general'): string {
  const items = getRecentMemory(category);
  if (!items || items.length === 0) return '';

  let block = `\nRECENTLY GENERATED/USED — DO NOT REPEAT OR CLOSELY RESEMBLE THESE CONCEPTS/TEXTS:\n`;

  items.forEach((item, index) => {
    let text = item.text.trim();
    if (text.length > 180) {
      text = text.substring(0, 180) + '...';
    }
    block += `${index + 1}. "${text}"\n`;
  });

  return block;
}

export function getAllCategoryKeys(): string[] {
  if (typeof window === 'undefined') return [];
  const categories: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key !== LIMIT_KEY) {
        categories.push(key.substring(STORAGE_PREFIX.length));
      }
    }
  } catch {}
  return categories;
}

export function getMemoryStats(): { category: string; count: number }[] {
  if (typeof window === 'undefined') return [];
  const stats: { category: string; count: number }[] = [];
  try {
    const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...getAllCategoryKeys()]));
    categories.forEach((category) => {
      const items = getRecentMemory(category);
      stats.push({ category, count: items.length });
    });
  } catch {}
  return stats;
}

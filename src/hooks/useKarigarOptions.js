import { useState, useEffect } from 'react';
import { SEEDED_KARIGARS } from '../pages/Master/masterdata';

/**
 * Returns the live list of karigars from localStorage (master_karigars_v3).
 * Falls back to SEEDED_KARIGARS if nothing is stored yet.
 * @returns {{ value: string, label: string }[]}  — options array for dropdowns
 */
export function useKarigarOptions() {
  const [options, setOptions] = useState(() => getKarigarOptions());

  useEffect(() => {
    // Re-read on focus (user may have added karigars in another tab/window)
    const refresh = () => setOptions(getKarigarOptions());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  return options;
}

/**
 * Synchronous helper — use this outside of components (e.g. in useState initialisers).
 */
export function getKarigarOptions() {
  try {
    const saved = localStorage.getItem('master_karigars_v3');
    const list = saved ? JSON.parse(saved) : SEEDED_KARIGARS;
    return list
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(k => ({
        value: k.name,
        label: `${k.name} (${k.type})`
      }));
  } catch {
    return [];
  }
}

'use client';

import { useEffect, useState } from 'react';

const FAVORITES_KEY = 'footstats:favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as string[];
      setFavorites(parsed);
    } catch {
      localStorage.removeItem(FAVORITES_KEY);
    }
  }, []);

  const toggleFavorite = (item: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { favorites, toggleFavorite };
};

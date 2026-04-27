'use client';

import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  id: string;
  label?: string;
}

export const FavoriteButton = ({ id, label = 'Favoritar' }: FavoriteButtonProps) => {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:border-brand"
    >
      {isFavorite ? '★ Favorito' : `☆ ${label}`}
    </button>
  );
};

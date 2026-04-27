'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 450);

    return () => clearTimeout(timeout);
  }, [value, router, pathname, searchParams]);

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none ring-brand transition focus:ring"
      placeholder="Buscar jogador, time ou liga..."
    />
  );
};

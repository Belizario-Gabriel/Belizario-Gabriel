import { SearchResults } from '@/components/SearchResults';

interface HomeProps {
  searchParams: {
    q?: string;
  };
}

export default function Home({ searchParams }: HomeProps) {
  const query = searchParams.q?.trim() ?? '';

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">FootStats</h1>
      <p className="text-slate-300">
        Busque por jogadores, times e ligas em um único lugar.
      </p>
      <SearchResults query={query} />
    </section>
  );
}

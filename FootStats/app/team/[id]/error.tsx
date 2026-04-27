'use client';

export default function ErrorTeam({ error }: { error: Error }) {
  return <p className="text-red-400">Erro ao carregar time: {error.message}</p>;
}

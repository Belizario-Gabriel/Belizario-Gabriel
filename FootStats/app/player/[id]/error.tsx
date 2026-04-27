'use client';

export default function ErrorPlayer({ error }: { error: Error }) {
  return <p className="text-red-400">Erro ao carregar jogador: {error.message}</p>;
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">Conteúdo não encontrado</h2>
      <p className="text-slate-300">O recurso solicitado não existe ou não está disponível no momento.</p>
      <Link href="/" className="text-brand underline">
        Voltar para busca
      </Link>
    </div>
  );
}

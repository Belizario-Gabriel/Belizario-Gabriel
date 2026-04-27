export const truncate = (value: string | undefined, max = 200): string => {
  if (!value) return 'Sem descrição disponível.';
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
};

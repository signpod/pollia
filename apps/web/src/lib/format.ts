export function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  const man = n / 10000;
  return man % 1 === 0 ? `${man}만` : `${man.toFixed(1)}만`;
}

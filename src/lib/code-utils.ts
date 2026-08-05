export function formatTournamentCode(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const clean = upper.replace(/-/g, "");
  if (clean.length <= 2) return clean;
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}`;
}

export function formatMasterKey(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const clean = upper.replace(/-/g, "");
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
}

function hashBase36(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(6, "0");
}

export function generateTournamentCode(): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  const hash = hashBase36(`${now}${rand}`);
  const seg = hash.slice(0, 4);
  return `FC-${seg}`;
}

export function generateMasterKey(): string {
  const now = Date.now().toString();
  const rand = Math.random().toString();
  const hash = hashBase36(`${now}${rand}`);
  const seg1 = hash.slice(0, 3);
  const seg2 = hash.slice(3, 6);
  return `${seg1}-${seg2}`;
}

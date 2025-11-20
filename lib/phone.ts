export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.replace(/[^0-9+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("8") && s.length === 11) s = "+7" + s.slice(1);
  if (!s.startsWith("+") && s.length === 10) s = "+38" + s;
  return s;
}

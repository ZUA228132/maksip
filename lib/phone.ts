export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return null;

  if (digits.startsWith("0") && digits.length === 10) {
    return "+38" + digits;
  }
  if (digits.startsWith("380") && digits.length === 12) {
    return "+" + digits;
  }
  if (digits.startsWith("8") && digits.length === 11) {
    return "+7" + digits.slice(1);
  }

  return "+" + digits;
}

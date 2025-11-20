type BalanceResponse = {
  balance: number;
  currency?: string;
};

export async function fetchSipBalance(): Promise<BalanceResponse | null> {
  const base = process.env.SIP_BASE_URL;
  const login = process.env.SIP_LOGIN;
  const password = process.env.SIP_PASSWORD;

  if (!base || !login || !password) return null;

  try {
    const url = `${base}/api/balance.php?login=${encodeURIComponent(
      login
    )}&password=${encodeURIComponent(password)}`;

    const res = await fetch(url, {
      // @ts-ignore
      cache: "no-store"
    });

    if (!res.ok) return null;

    const text = await res.text();

    const num = Number(
      (text || "").trim().replace(",", ".").replace(/[^0-9.\-]/g, "")
    );

    if (Number.isNaN(num)) return null;

    return { balance: num, currency: "UAH" };
  } catch {
    return null;
  }
}

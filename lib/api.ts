export const API_BASE = "/api";

type ClerkWindow = Window & typeof globalThis & {
  Clerk?: { session?: { getToken: () => Promise<string | null> } };
};

async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as ClerkWindow).Clerk;
    if (!clerk?.session) return null;
    return await clerk.session.getToken();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = await getClerkToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders, ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

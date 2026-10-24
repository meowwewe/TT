const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl || "https://duanbackup-api.havandungismeo.workers.dev/api"
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}

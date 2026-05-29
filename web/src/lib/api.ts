const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...init,
    })

    const json = await res.json()

    if (!res.ok) {
      return { data: null, error: json.error ?? 'Bir hata oluştu' }
    }

    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Sunucuya ulaşılamadı' }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

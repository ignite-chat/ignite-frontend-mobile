const API_BASE_URL = 'https://api.ignite-chat.com/v1';

type RequestOptions = {
  method?: string;
  body?: Record<string, unknown>;
  token?: string | null;
};

type ApiResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  status: number;
  message: string;
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data.message ?? 'Something went wrong',
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Network error. Check your connection.',
    };
  }
}

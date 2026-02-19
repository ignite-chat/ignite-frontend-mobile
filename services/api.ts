const API_BASE_URL = 'https://api.ignite-chat.com/v1';

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function getApiToken(): string | null {
  return _token;
}

type RequestOptions = {
  method?: string;
  body?: Record<string, unknown>;
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
  { method = 'GET', body }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  try {
    console.log(`[API] ${method} ${path}`);
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      console.log(`[API] ${method} ${path} -> ${res.status} FAIL`, data);
      return {
        ok: false,
        status: res.status,
        message: data.message ?? 'Something went wrong',
      };
    }

    console.log(`[API] ${method} ${path} -> ${res.status} OK`);
    return { ok: true, data: data as T };
  } catch {
    console.log(`[API] ${method} ${path} -> NETWORK ERROR`);
    return {
      ok: false,
      status: 0,
      message: 'Network error. Check your connection.',
    };
  }
}

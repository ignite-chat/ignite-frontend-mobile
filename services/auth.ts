import { apiRequest } from './api';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_bot: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export function login(username: string, password: string, hcaptchaToken: string) {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: { username, password, hcaptcha_captcha_token: hcaptchaToken },
  });
}

export function register(username: string, hcaptchaToken: string, email?: string, password?: string) {
  return apiRequest<AuthResponse>('/register', {
    method: 'POST',
    body: {
      username,
      hcaptcha_captcha_token: hcaptchaToken,
      email: email || undefined,
      password: password || undefined,
    },
  });
}

export function getMe() {
  return apiRequest<User>('/@me');
}

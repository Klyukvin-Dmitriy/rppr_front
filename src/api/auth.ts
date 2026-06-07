import { UserCreate } from '../types/auth';

interface LoginResponse {
  access_token: string;
  token_type?: string;
  first_name?: string;
  last_name?: string;
  is_manager?: boolean;
}

// Mock-пользователи для демонстрации
const MOCK_USERS = [
  {
    login: 'user@example.com',
    password: 'password123',
    first_name: 'Иван',
    last_name: 'Петров',
    is_manager: false,
  },
  {
    login: 'admin@example.com',
    password: 'admin123',
    first_name: 'Админ',
    last_name: 'Системов',
    is_manager: true,
  },
];

export const register = async (data: UserCreate) => {
  try {
    const response = await fetch(`/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Ошибка регистрации');
    }
    return response.json();
  } catch {
    // Mock-регистрация
    return { id: Date.now(), ...data };
  }
};

export const login = async (loginName: string, password_str: string): Promise<LoginResponse> => {
  try {
    const body = new URLSearchParams();
    body.append('grant_type', '');
    body.append('username', loginName);
    body.append('password', password_str);
    body.append('scope', '');
    body.append('client_id', '');
    body.append('client_secret', '');

    const response = await fetch(`/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error('Ошибка входа');
    }
    return response.json();
  } catch {
    // Mock-авторизация
    const user = MOCK_USERS.find(u => u.login === loginName && u.password === password_str);
    
    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    // Генерируем mock JWT токен
    const mockToken = btoa(JSON.stringify({
      sub: user.login,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));

    return {
      access_token: mockToken,
      token_type: 'bearer',
      first_name: user.first_name,
      last_name: user.last_name,
      is_manager: user.is_manager,
    };
  }
};

export const refresh = async () => {
  console.warn('Функция refresh не реализована');
  return Promise.resolve({ access_token: '' });
};
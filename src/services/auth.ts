import { api } from './api';

export type LoginResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken?: string;
  token?: string;
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    '/auth/login',
    {
      username,
      password,
      expiresInMins: 30,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return data;
}
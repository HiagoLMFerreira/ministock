import axios from 'axios';

import { getToken, removeToken } from '../storage/authStorage';

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error('Sem conexão, tente novamente.'));
    }

    const status = error.response.status;

    if (status === 401) {
      await removeToken();

      if (unauthorizedHandler) {
        unauthorizedHandler();
      }

      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('Recurso não encontrado.'));
    }

    if (status >= 500) {
      return Promise.reject(new Error('Erro no servidor, tente novamente.'));
    }

    return Promise.reject(error);
  }
);
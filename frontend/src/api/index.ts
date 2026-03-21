import axios from "axios";
import type { AuthResponse, MatchRequest, MatchResult, Resume, Vacancy, User } from "../types";

const usersApi = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL ?? "http://localhost:3001",
  withCredentials: true,
});

const coreApi = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL ?? "http://localhost:3002",
  withCredentials: true,
});

const authApiRaw = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL ?? "http://localhost:3001",
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = "accessToken";
const ACCESS_TOKEN_HEADER = "x-access-token";

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem("token");
  },
  setTokens(tokens: { accessToken: string; refreshToken?: string }) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem("token", tokens.accessToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("token");
  },
};

const withAuth = (instance: typeof usersApi | typeof coreApi) => {
  instance.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

withAuth(usersApi);
withAuth(coreApi);

let refreshPromise: Promise<{ accessToken: string; refreshToken?: string } | null> | null = null;

async function refreshTokens(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const { data } = await authApiRaw.post<{ token: string; accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    {}
  );

  const accessToken = data.accessToken ?? data.token;
  if (!accessToken) return null;
  return { accessToken, refreshToken: data.refreshToken };
}

function withAutoRefresh(instance: typeof usersApi | typeof coreApi) {
  instance.interceptors.response.use(
    (response) => {
      const rotatedAccessToken = response.headers?.[ACCESS_TOKEN_HEADER] as string | undefined;
      if (rotatedAccessToken) {
        tokenStorage.setTokens({ accessToken: rotatedAccessToken });
      }

      return response;
    },
    async (error) => {
      const originalRequest = error?.config as
        | (typeof error.config & { _retry?: boolean })
        | undefined;

      const status = error?.response?.status;
      if (!originalRequest || status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshTokens();
        const tokens = await refreshPromise;
        if (!tokens) {
          tokenStorage.clear();
          return Promise.reject(error);
        }

        tokenStorage.setTokens(tokens);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return instance.request(originalRequest);
      } catch (e) {
        tokenStorage.clear();
        return Promise.reject(e);
      } finally {
        refreshPromise = null;
      }
    }
  );
}

withAutoRefresh(usersApi);
withAutoRefresh(coreApi);

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await usersApi.post<AuthResponse>("/auth/login", { email, password });
    return data;
  },
  async register(email: string, password: string, role?: User["role"]): Promise<AuthResponse> {
    const { data } = await usersApi.post<AuthResponse>("/auth/register", { email, password, role });
    return data;
  },
  async refresh(): Promise<{ accessToken: string; refreshToken: string; token: string }> {
    const { data } = await authApiRaw.post<{ token: string; accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      {}
    );
    return data;
  },
  async me(): Promise<User> {
    const { data } = await usersApi.get<User>("/users/me");
    return data;
  },
};

export const resumesApi = {
  async list(): Promise<Resume[]> {
    const { data } = await coreApi.get<Resume[]>("/resumes");
    return data;
  },
  async create(payload: Pick<Resume, "title" | "rawText">): Promise<Resume> {
    const { data } = await coreApi.post<Resume>("/resumes", payload);
    return data;
  },
  async update(id: string, payload: Partial<Pick<Resume, "title" | "rawText">>): Promise<Resume> {
    const { data } = await coreApi.patch<Resume>(`/resumes/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await coreApi.delete(`/resumes/${id}`);
  },
};

export const vacanciesApi = {
  async list(): Promise<Vacancy[]> {
    const { data } = await coreApi.get<Vacancy[]>("/vacancies");
    return data;
  },
  async create(payload: Pick<Vacancy, "title" | "company" | "rawText">): Promise<Vacancy> {
    const { data } = await coreApi.post<Vacancy>("/vacancies", payload);
    return data;
  },
  async update(
    id: string,
    payload: Partial<Pick<Vacancy, "title" | "company" | "rawText">>
  ): Promise<Vacancy> {
    const { data } = await coreApi.patch<Vacancy>(`/vacancies/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await coreApi.delete(`/vacancies/${id}`);
  },
};

export const matchApi = {
  async match(payload: MatchRequest): Promise<MatchResult> {
    const { data } = await coreApi.post<MatchResult>("/match", payload);
    return data;
  },
};

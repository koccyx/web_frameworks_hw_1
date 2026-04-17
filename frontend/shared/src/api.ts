import axios from "axios";
import type { AuthResponse, MatchRequest, MatchResult, Resume, User, Vacancy } from "./types";
import { tokenStorage } from "./token-storage";

const usersBaseUrl = process.env.USERS_API_URL ?? "http://localhost:3001";
const coreBaseUrl = process.env.CORE_API_URL ?? "http://localhost:3002";
const ACCESS_TOKEN_HEADER = "x-access-token";

const usersApi = axios.create({ baseURL: usersBaseUrl, withCredentials: true });
const coreApi = axios.create({ baseURL: coreBaseUrl, withCredentials: true });
const authApiRaw = axios.create({ baseURL: usersBaseUrl, withCredentials: true });

function withAuth(instance: typeof usersApi | typeof coreApi) {
  instance.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

withAuth(usersApi);
withAuth(coreApi);

let refreshPromise: Promise<{ accessToken: string; refreshToken?: string } | null> | null = null;

async function refreshTokens(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const { data } = await authApiRaw.post<{ token: string; accessToken: string; refreshToken: string }>("/auth/refresh", {});
  const accessToken = data.accessToken ?? data.token;
  if (!accessToken) return null;
  return { accessToken, refreshToken: data.refreshToken };
}

function withAutoRefresh(instance: typeof usersApi | typeof coreApi) {
  instance.interceptors.response.use(
    (response) => {
      const rotatedAccessToken = response.headers?.[ACCESS_TOKEN_HEADER] as string | undefined;
      if (rotatedAccessToken) tokenStorage.setAccess(rotatedAccessToken);
      return response;
    },
    async (error) => {
      const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
      const status = error?.response?.status;
      if (!originalRequest || status !== 401 || originalRequest._retry) return Promise.reject(error);

      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshTokens();
        const tokens = await refreshPromise;
        if (!tokens) {
          tokenStorage.clear();
          return Promise.reject(error);
        }
        tokenStorage.setAccess(tokens.accessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return instance.request(originalRequest);
      } finally {
        refreshPromise = null;
      }
    }
  );
}

withAutoRefresh(usersApi);
withAutoRefresh(coreApi);

export const authApi = {
  login(email: string, password: string) {
    return usersApi.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);
  },
  register(email: string, password: string) {
    return usersApi.post<AuthResponse>("/auth/register", { email, password }).then((r) => r.data);
  },
  me() {
    return usersApi.get<User>("/users/me").then((r) => r.data);
  },
};

export const resumesApi = {
  list() {
    return coreApi.get<Resume[]>("/resumes").then((r) => r.data);
  },
  create(payload: Pick<Resume, "title" | "rawText">) {
    return coreApi.post<Resume>("/resumes", payload).then((r) => r.data);
  },
  update(id: string, payload: Partial<Pick<Resume, "title" | "rawText">>) {
    return coreApi.patch<Resume>(`/resumes/${id}`, payload).then((r) => r.data);
  },
  remove(id: string) {
    return coreApi.delete(`/resumes/${id}`).then(() => undefined);
  },
};

export const vacanciesApi = {
  list() {
    return coreApi.get<Vacancy[]>("/vacancies").then((r) => r.data);
  },
  create(payload: Pick<Vacancy, "title" | "company" | "rawText">) {
    return coreApi.post<Vacancy>("/vacancies", payload).then((r) => r.data);
  },
  update(id: string, payload: Partial<Pick<Vacancy, "title" | "company" | "rawText">>) {
    return coreApi.patch<Vacancy>(`/vacancies/${id}`, payload).then((r) => r.data);
  },
  remove(id: string) {
    return coreApi.delete(`/vacancies/${id}`).then(() => undefined);
  },
};

export const matchApi = {
  run(payload: MatchRequest) {
    return coreApi.post<MatchResult>("/match", payload).then((r) => r.data);
  },
};

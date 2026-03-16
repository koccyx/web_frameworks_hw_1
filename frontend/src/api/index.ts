import axios from "axios";
import type { AuthResponse, MatchRequest, MatchResult, Resume, Vacancy, User } from "../types";

const usersApi = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL ?? "http://localhost:3001",
});

const coreApi = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL ?? "http://localhost:3002",
});

const getToken = () => localStorage.getItem("token");

const withAuth = (instance: typeof usersApi | typeof coreApi) => {
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

withAuth(usersApi);
withAuth(coreApi);

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await usersApi.post<AuthResponse>("/auth/login", { email, password });
    return data;
  },
  async register(email: string, password: string, role?: User["role"]): Promise<AuthResponse> {
    const { data } = await usersApi.post<AuthResponse>("/auth/register", { email, password, role });
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


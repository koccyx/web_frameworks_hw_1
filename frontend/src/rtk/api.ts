import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, MatchRequest, MatchResult, Resume, User, Vacancy } from "../types";
import { tokenStorage } from "./tokenStorage";

const usersBase = import.meta.env.VITE_USERS_API_URL ?? "http://localhost:3001";
const coreBase = import.meta.env.VITE_CORE_API_URL ?? "http://localhost:3002";

export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: fetchBaseQuery({
    baseUrl: usersBase,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = tokenStorage.getAccess();
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  keepUnusedDataFor: 120,
  tagTypes: ["User", "Resume", "Vacancy", "Match"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    me: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    resumes: builder.query<Resume[], void>({
      query: () => ({ url: `${coreBase}/resumes` }),
      providesTags: ["Resume"],
    }),
    createResume: builder.mutation<Resume, Pick<Resume, "title" | "rawText">>({
      query: (body) => ({ url: `${coreBase}/resumes`, method: "POST", body }),
      invalidatesTags: ["Resume"],
    }),
    updateResume: builder.mutation<Resume, { id: string; payload: Partial<Pick<Resume, "title" | "rawText">> }>({
      query: ({ id, payload }) => ({ url: `${coreBase}/resumes/${id}`, method: "PATCH", body: payload }),
      invalidatesTags: ["Resume"],
    }),
    deleteResume: builder.mutation<void, string>({
      query: (id) => ({ url: `${coreBase}/resumes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Resume"],
    }),
    vacancies: builder.query<Vacancy[], void>({
      query: () => ({ url: `${coreBase}/vacancies` }),
      providesTags: ["Vacancy"],
    }),
    createVacancy: builder.mutation<Vacancy, Pick<Vacancy, "title" | "company" | "rawText">>({
      query: (body) => ({ url: `${coreBase}/vacancies`, method: "POST", body }),
      invalidatesTags: ["Vacancy"],
    }),
    updateVacancy: builder.mutation<
      Vacancy,
      { id: string; payload: Partial<Pick<Vacancy, "title" | "company" | "rawText">> }
    >({
      query: ({ id, payload }) => ({ url: `${coreBase}/vacancies/${id}`, method: "PATCH", body: payload }),
      invalidatesTags: ["Vacancy"],
    }),
    deleteVacancy: builder.mutation<void, string>({
      query: (id) => ({ url: `${coreBase}/vacancies/${id}`, method: "DELETE" }),
      invalidatesTags: ["Vacancy"],
    }),
    runMatch: builder.mutation<MatchResult, MatchRequest>({
      query: (body) => ({ url: `${coreBase}/match`, method: "POST", body }),
      invalidatesTags: ["Match"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useResumesQuery,
  useCreateResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
  useRunMatchMutation,
} = appApi;


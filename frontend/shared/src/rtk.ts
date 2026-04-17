import { configureStore } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { authApi, matchApi, resumesApi, vacanciesApi } from "./api";
import { tokenStorage } from "./token-storage";
import type {
  AuthResponse,
  MatchResult,
  Resume,
  User,
  Vacancy,
  MatchRequest,
} from "./types";

export const backendApi = createApi({
  reducerPath: "backendApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Resumes", "Vacancies", "Match"],
  endpoints: (builder) => ({
    me: builder.query<User, void>({
      async queryFn() {
        try {
          const data = await authApi.me();
          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["User"],
      keepUnusedDataFor: 120,
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      async queryFn(payload) {
        try {
          const data = await authApi.login(payload.email, payload.password);
          tokenStorage.setAccess(data.accessToken ?? data.token);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<AuthResponse, { email: string; password: string }>({
      async queryFn(payload) {
        try {
          const data = await authApi.register(payload.email, payload.password);
          tokenStorage.setAccess(data.accessToken ?? data.token);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["User"],
    }),
    resumes: builder.query<Resume[], void>({
      async queryFn() {
        try {
          const data = await resumesApi.list();
          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Resumes"],
      keepUnusedDataFor: 300,
    }),
    vacancies: builder.query<Vacancy[], void>({
      async queryFn() {
        try {
          const data = await vacanciesApi.list();
          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Vacancies"],
      keepUnusedDataFor: 300,
    }),
    createResume: builder.mutation<Resume, Pick<Resume, "title" | "rawText">>({
      async queryFn(payload) {
        try {
          const data = await resumesApi.create(payload);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Resumes"],
    }),
    updateResume: builder.mutation<Resume, { id: string; payload: Partial<Pick<Resume, "title" | "rawText">> }>({
      async queryFn({ id, payload }) {
        try {
          const data = await resumesApi.update(id, payload);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Resumes"],
    }),
    deleteResume: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await resumesApi.remove(id);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Resumes"],
    }),
    createVacancy: builder.mutation<Vacancy, Pick<Vacancy, "title" | "company" | "rawText">>({
      async queryFn(payload) {
        try {
          const data = await vacanciesApi.create(payload);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Vacancies"],
    }),
    updateVacancy: builder.mutation<Vacancy, { id: string; payload: Partial<Pick<Vacancy, "title" | "company" | "rawText">> }>({
      async queryFn({ id, payload }) {
        try {
          const data = await vacanciesApi.update(id, payload);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Vacancies"],
    }),
    deleteVacancy: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await vacanciesApi.remove(id);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Vacancies"],
    }),
    runMatch: builder.mutation<MatchResult, MatchRequest>({
      async queryFn(payload) {
        try {
          const data = await matchApi.run(payload);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Match"],
    }),
  }),
});

export const store = configureStore({
  reducer: {
    [backendApi.reducerPath]: backendApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useResumesQuery,
  useVacanciesQuery,
  useCreateResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
  useRunMatchMutation,
} = backendApi;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ResumeFormState, VacancyFormState } from "../state/forms";

export type Tab = "profile" | "resumes" | "vacancies" | "match";
type ThemeMode = "dark" | "light";

interface UiState {
  email: string;
  password: string;
  isRegister: boolean;
  loading: boolean;
  error: string | null;
  captchaImage: string;
  captchaExpected: string;
  captchaValue: string;
  tab: Tab;
  selectedResumeId: string;
  selectedVacancyId: string;
  theme: ThemeMode;
  resumeForm: ResumeFormState;
  vacancyForm: VacancyFormState;
}

const initialState: UiState = {
  email: "",
  password: "",
  isRegister: false,
  loading: false,
  error: null,
  captchaImage: "",
  captchaExpected: "",
  captchaValue: "",
  tab: "profile",
  selectedResumeId: "",
  selectedVacancyId: "",
  theme: localStorage.getItem("themeMode") === "light" ? "light" : "dark",
  resumeForm: { title: "", rawText: "" },
  vacancyForm: { title: "", company: "", rawText: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setIsRegister: (state, action: PayloadAction<boolean>) => {
      state.isRegister = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCaptchaData: (
      state,
      action: PayloadAction<{ captchaImage: string; captchaExpected: string; captchaValue: string }>
    ) => {
      state.captchaImage = action.payload.captchaImage;
      state.captchaExpected = action.payload.captchaExpected;
      state.captchaValue = action.payload.captchaValue;
    },
    setCaptchaValue: (state, action: PayloadAction<string>) => {
      state.captchaValue = action.payload;
    },
    setTab: (state, action: PayloadAction<Tab>) => {
      state.tab = action.payload;
    },
    setSelectedResumeId: (state, action: PayloadAction<string>) => {
      state.selectedResumeId = action.payload;
    },
    setSelectedVacancyId: (state, action: PayloadAction<string>) => {
      state.selectedVacancyId = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    setResumeForm: (state, action: PayloadAction<ResumeFormState>) => {
      state.resumeForm = action.payload;
    },
    setVacancyForm: (state, action: PayloadAction<VacancyFormState>) => {
      state.vacancyForm = action.payload;
    },
    resetAuthForm: (state) => {
      state.email = "";
      state.password = "";
    },
  },
});

export const {
  setEmail,
  setPassword,
  setIsRegister,
  setLoading,
  setError,
  setCaptchaData,
  setCaptchaValue,
  setTab,
  setSelectedResumeId,
  setSelectedVacancyId,
  setTheme,
  setResumeForm,
  setVacancyForm,
  resetAuthForm,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;


import { makeAutoObservable, runInAction } from "mobx";
import { authApi, matchApi, resumesApi, tokenStorage, vacanciesApi } from "../api";
import type { MatchResult, Resume, User, Vacancy } from "../types";
import type { ResumeFormState, VacancyFormState } from "../state/forms";

type Tab = "profile" | "resumes" | "vacancies" | "match";
type ThemeMode = "dark" | "light";

const CACHE_TTL_MS = 60_000;

export class AppStore {
  user: User | null = null;
  email = "";
  password = "";
  isRegister = false;
  loading = false;
  error: string | null = null;
  captchaImage = "";
  captchaExpected = "";
  captchaValue = "";

  tab: Tab = "profile";
  resumes: Resume[] = [];
  vacancies: Vacancy[] = [];
  selectedResumeId = "";
  selectedVacancyId = "";
  matchResult: MatchResult | null = null;
  matchLoading = false;
  theme: ThemeMode = localStorage.getItem("themeMode") === "light" ? "light" : "dark";

  resumeForm: ResumeFormState = { title: "", rawText: "" };
  vacancyForm: VacancyFormState = { title: "", company: "", rawText: "" };

  private resumesLoadedAt = 0;
  private vacanciesLoadedAt = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.regenerateCaptcha();
    this.bootstrapAuth();
  }

  get isAuthenticated() {
    return Boolean(this.user);
  }

  get me() {
    return this.user;
  }

  setTheme(theme: ThemeMode) {
    this.theme = theme;
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("themeMode", theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === "dark" ? "light" : "dark");
  }

  async bootstrapAuth() {
    this.setTheme(this.theme);
    const token = tokenStorage.getAccess();
    if (!token) return;
    try {
      const me = await authApi.me();
      runInAction(() => {
        this.user = me;
      });
      await this.loadData();
    } catch {
      tokenStorage.clear();
    }
  }

  regenerateCaptcha() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const text = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const noiseLines = Array.from({ length: 6 }, () => {
      const x1 = Math.floor(Math.random() * 160);
      const y1 = Math.floor(Math.random() * 60);
      const x2 = Math.floor(Math.random() * 160);
      const y2 = Math.floor(Math.random() * 60);
      const color = `rgba(${80 + Math.floor(Math.random() * 120)}, ${80 + Math.floor(Math.random() * 120)}, ${
        80 + Math.floor(Math.random() * 120)
      }, 0.55)`;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" />`;
    }).join("");

    const chars = text
      .split("")
      .map((char, index) => {
        const x = 16 + index * 28;
        const y = 38 + Math.floor(Math.random() * 10) - 5;
        const rotate = Math.floor(Math.random() * 30) - 15;
        return `<text x="${x}" y="${y}" fill="#1f2937" font-size="30" font-family="monospace" font-weight="700" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
      })
      .join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect width="160" height="60" fill="#f8fafc"/>${noiseLines}${chars}</svg>`;
    this.captchaImage = `data:image/svg+xml;base64,${btoa(svg)}`;
    this.captchaExpected = text;
    this.captchaValue = "";
  }

  async handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (this.captchaValue.trim().toUpperCase() !== this.captchaExpected) {
      this.error = "Неверно введена капча.";
      this.regenerateCaptcha();
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const { token, accessToken, refreshToken, user } = this.isRegister
        ? await authApi.register(this.email, this.password)
        : await authApi.login(this.email, this.password);
      tokenStorage.setTokens({ accessToken: accessToken ?? token, refreshToken });
      runInAction(() => {
        this.user = user;
        this.email = "";
        this.password = "";
        this.error = null;
        this.tab = "profile";
      });
      this.regenerateCaptcha();
      await this.loadData(true);
    } catch (err: unknown) {
      const maybeError = err as { response?: { status?: number } };
      runInAction(() => {
        this.error =
          this.isRegister && maybeError?.response?.status === 409
            ? "Этот email уже зарегистрирован."
            : "Ошибка авторизации. Проверьте email/пароль.";
      });
      this.regenerateCaptcha();
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  logout() {
    tokenStorage.clear();
    this.user = null;
    this.email = "";
    this.password = "";
    this.resumes = [];
    this.vacancies = [];
    this.matchResult = null;
    this.resumesLoadedAt = 0;
    this.vacanciesLoadedAt = 0;
  }

  async loadData(force = false) {
    try {
      const now = Date.now();
      const shouldLoadResumes = force || now - this.resumesLoadedAt > CACHE_TTL_MS;
      const shouldLoadVacancies = force || now - this.vacanciesLoadedAt > CACHE_TTL_MS;

      const [resumes, vacancies] = await Promise.all([
        shouldLoadResumes ? resumesApi.list() : Promise.resolve(this.resumes),
        shouldLoadVacancies ? vacanciesApi.list() : Promise.resolve(this.vacancies),
      ]);

      runInAction(() => {
        this.resumes = resumes;
        this.vacancies = vacancies;
        if (shouldLoadResumes) this.resumesLoadedAt = now;
        if (shouldLoadVacancies) this.vacanciesLoadedAt = now;
        if (resumes.length > 0 && !this.selectedResumeId) this.selectedResumeId = resumes[0].id;
        if (vacancies.length > 0 && !this.selectedVacancyId) this.selectedVacancyId = vacancies[0].id;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить данные.";
      });
    }
  }

  async submitResume(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (this.resumeForm.id) {
        const updated = await resumesApi.update(this.resumeForm.id, {
          title: this.resumeForm.title,
          rawText: this.resumeForm.rawText,
        });
        runInAction(() => {
          this.resumes = this.resumes.map((r) => (r.id === updated.id ? updated : r));
        });
      } else {
        const created = await resumesApi.create({
          title: this.resumeForm.title,
          rawText: this.resumeForm.rawText,
        });
        runInAction(() => {
          this.resumes = [created, ...this.resumes];
        });
      }
      runInAction(() => {
        this.resumeForm = { title: "", rawText: "" };
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось сохранить резюме.";
      });
    }
  }

  editResume(resume: Resume) {
    this.resumeForm = { id: resume.id, title: resume.title, rawText: resume.rawText };
  }

  async deleteResume(id: string) {
    if (!window.confirm("Удалить резюме?")) return;
    try {
      await resumesApi.remove(id);
      runInAction(() => {
        this.resumes = this.resumes.filter((r) => r.id !== id);
        if (this.selectedResumeId === id) this.selectedResumeId = this.resumes[0]?.id ?? "";
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось удалить резюме.";
      });
    }
  }

  async submitVacancy(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (this.vacancyForm.id) {
        const updated = await vacanciesApi.update(this.vacancyForm.id, {
          title: this.vacancyForm.title,
          company: this.vacancyForm.company,
          rawText: this.vacancyForm.rawText,
        });
        runInAction(() => {
          this.vacancies = this.vacancies.map((v) => (v.id === updated.id ? updated : v));
        });
      } else {
        const created = await vacanciesApi.create({
          title: this.vacancyForm.title,
          company: this.vacancyForm.company,
          rawText: this.vacancyForm.rawText,
        });
        runInAction(() => {
          this.vacancies = [created, ...this.vacancies];
        });
      }
      runInAction(() => {
        this.vacancyForm = { title: "", company: "", rawText: "" };
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось сохранить вакансию.";
      });
    }
  }

  editVacancy(vacancy: Vacancy) {
    this.vacancyForm = { id: vacancy.id, title: vacancy.title, company: vacancy.company, rawText: vacancy.rawText };
  }

  async deleteVacancy(id: string) {
    if (!window.confirm("Удалить вакансию?")) return;
    try {
      await vacanciesApi.remove(id);
      runInAction(() => {
        this.vacancies = this.vacancies.filter((v) => v.id !== id);
        if (this.selectedVacancyId === id) this.selectedVacancyId = this.vacancies[0]?.id ?? "";
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось удалить вакансию.";
      });
    }
  }

  async runMatch() {
    if (!this.selectedResumeId || !this.selectedVacancyId) {
      this.error = "Выберите резюме и вакансию для сравнения.";
      return;
    }
    this.error = null;
    this.matchResult = null;
    this.matchLoading = true;
    try {
      const result = await matchApi.match({ resumeId: this.selectedResumeId, vacancyId: this.selectedVacancyId });
      runInAction(() => {
        this.matchResult = result;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось выполнить сравнение.";
      });
    } finally {
      runInAction(() => {
        this.matchLoading = false;
      });
    }
  }
}

export const appStore = new AppStore();


import { useEffect } from "react";
import { AuthView } from "../components/AuthView";
import { MatchView } from "../components/MatchView";
import { ProfileView } from "../components/ProfileView";
import { ResumesView } from "../components/ResumesView";
import { VacanciesView } from "../components/VacanciesView";
import type { Resume, Vacancy } from "../types";
import {
  useCreateResumeMutation,
  useCreateVacancyMutation,
  useDeleteResumeMutation,
  useDeleteVacancyMutation,
  useLoginMutation,
  useMeQuery,
  useRegisterMutation,
  useResumesQuery,
  useRunMatchMutation,
  useUpdateResumeMutation,
  useUpdateVacancyMutation,
  useVacanciesQuery,
} from "./api";
import { useAppDispatch, useAppSelector } from "./hooks";
import { tokenStorage } from "./tokenStorage";
import type { AppDispatch } from "./store";
import {
  resetAuthForm,
  setCaptchaData,
  setCaptchaValue,
  setEmail,
  setError,
  setIsRegister,
  setLoading,
  setPassword,
  setResumeForm,
  setSelectedResumeId,
  setSelectedVacancyId,
  setTab,
  setTheme,
  setVacancyForm,
} from "./uiSlice";

export function RtkApp() {
  const appLabel = "Вакансии от СТЕПАНА (Redux)";
  const dispatch = useAppDispatch();
  const {
    email,
    password,
    isRegister,
    loading,
    error,
    captchaImage,
    captchaExpected,
    captchaValue,
    tab,
    selectedResumeId,
    selectedVacancyId,
    theme,
    resumeForm,
    vacancyForm,
  } = useAppSelector((state) => state.ui);

  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const meQuery = useMeQuery(undefined, { skip: !tokenStorage.getAccess() });
  const resumesQuery = useResumesQuery(undefined, { skip: !meQuery.data });
  const vacanciesQuery = useVacanciesQuery(undefined, { skip: !meQuery.data });
  const [createResume] = useCreateResumeMutation();
  const [updateResume] = useUpdateResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [createVacancy] = useCreateVacancyMutation();
  const [updateVacancy] = useUpdateVacancyMutation();
  const [deleteVacancy] = useDeleteVacancyMutation();
  const [runMatch, matchState] = useRunMatchMutation();

  const resumes = resumesQuery.data ?? [];
  const vacancies = vacanciesQuery.data ?? [];
  const me = meQuery.data;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("themeMode", theme);
  }, [theme, dispatch]);

  useEffect(() => {
    regenerateCaptcha(dispatch);
  }, [isRegister, dispatch]);

  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) dispatch(setSelectedResumeId(resumes[0].id));
  }, [resumes, selectedResumeId, dispatch]);

  useEffect(() => {
    if (!selectedVacancyId && vacancies.length > 0) dispatch(setSelectedVacancyId(vacancies[0].id));
  }, [vacancies, selectedVacancyId, dispatch]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaValue.trim().toUpperCase() !== captchaExpected) {
      dispatch(setError("Неверно введена капча."));
      regenerateCaptcha(dispatch);
      return;
    }
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = isRegister
        ? await register({ email, password }).unwrap()
        : await login({ email, password }).unwrap();
      tokenStorage.setAccess(data.accessToken ?? data.token);
      dispatch(resetAuthForm());
      dispatch(setError(null));
      dispatch(setTab("profile"));
    } catch (err: unknown) {
      const maybeError = err as { status?: number; data?: { message?: string } };
      if (isRegister && maybeError?.status === 409) {
        dispatch(setError("Этот email уже зарегистрирован."));
      } else {
        dispatch(setError("Ошибка авторизации. Проверьте email/пароль."));
      }
    } finally {
      dispatch(setLoading(false));
      regenerateCaptcha(dispatch);
    }

    // meQuery can briefly fail during token/cookie propagation; it should not
    // be treated as invalid login credentials.
    void meQuery.refetch().catch(() => undefined);
  };

  const handleLogout = () => {
    tokenStorage.clear();
    window.location.reload();
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (resumeForm.id) {
        await updateResume({ id: resumeForm.id, payload: { title: resumeForm.title, rawText: resumeForm.rawText } }).unwrap();
      } else {
        await createResume({ title: resumeForm.title, rawText: resumeForm.rawText }).unwrap();
      }
      dispatch(setResumeForm({ title: "", rawText: "" }));
      resumesQuery.refetch();
    } catch {
      dispatch(setError("Не удалось сохранить резюме."));
    }
  };

  const handleVacancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (vacancyForm.id) {
        await updateVacancy({
          id: vacancyForm.id,
          payload: { title: vacancyForm.title, company: vacancyForm.company, rawText: vacancyForm.rawText },
        }).unwrap();
      } else {
        await createVacancy({ title: vacancyForm.title, company: vacancyForm.company, rawText: vacancyForm.rawText }).unwrap();
      }
      dispatch(setVacancyForm({ title: "", company: "", rawText: "" }));
      vacanciesQuery.refetch();
    } catch {
      dispatch(setError("Не удалось сохранить вакансию."));
    }
  };

  const handleMatch = async () => {
    if (!selectedResumeId || !selectedVacancyId) {
      dispatch(setError("Выберите резюме и вакансию для сравнения."));
      return;
    }
    dispatch(setError(null));
    await runMatch({ resumeId: selectedResumeId, vacancyId: selectedVacancyId });
  };

  const canShowAuth = !tokenStorage.getAccess() || !me;

  return (
    <>
      <button
        className="btn btn-sm btn-outline-secondary theme-toggle-btn"
        type="button"
        onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      {canShowAuth ? (
        <AuthView
          appLabel={appLabel}
          email={email}
          password={password}
          isRegister={isRegister}
          loading={loading}
          error={error}
          captchaImage={captchaImage}
          captchaValue={captchaValue}
          onEmailChange={(value) => dispatch(setEmail(value))}
          onPasswordChange={(value) => dispatch(setPassword(value))}
          onCaptchaChange={(value) => dispatch(setCaptchaValue(value))}
          onRefreshCaptcha={() => regenerateCaptcha(dispatch)}
          onToggleMode={() => dispatch(setIsRegister(!isRegister))}
          onSubmit={handleAuth}
        />
      ) : (
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h4 mb-0">{appLabel}</h1>
              <small className="text-muted">Панель управления</small>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                {me.email} ({me.role})
              </span>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button className={`nav-link ${tab === "profile" ? "active" : ""}`} type="button" onClick={() => dispatch(setTab("profile"))}>
                Профиль
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${tab === "resumes" ? "active" : ""}`} type="button" onClick={() => dispatch(setTab("resumes"))}>
                Резюме
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${tab === "vacancies" ? "active" : ""}`} type="button" onClick={() => dispatch(setTab("vacancies"))}>
                Вакансии
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${tab === "match" ? "active" : ""}`} type="button" onClick={() => dispatch(setTab("match"))}>
                Сопоставление
              </button>
            </li>
          </ul>
          {tab === "profile" && <ProfileView user={me} resumesCount={resumes.length} vacanciesCount={vacancies.length} />}
          {tab === "resumes" && (
            <ResumesView
              currentUserId={me.id}
              currentUserRole={me.role}
              resumes={resumes}
              resumeForm={resumeForm}
              onResumeFormChange={(value) => dispatch(setResumeForm(value))}
              onSubmit={handleResumeSubmit}
              onEdit={(r: Resume) => dispatch(setResumeForm({ id: r.id, title: r.title, rawText: r.rawText }))}
              onDelete={async (id: string) => {
                if (!window.confirm("Удалить резюме?")) return;
                await deleteResume(id);
                resumesQuery.refetch();
              }}
              onReload={() => resumesQuery.refetch()}
            />
          )}
          {tab === "vacancies" && (
            <VacanciesView
              currentUserId={me.id}
              currentUserRole={me.role}
              vacancies={vacancies}
              vacancyForm={vacancyForm}
              onVacancyFormChange={(value) => dispatch(setVacancyForm(value))}
              onSubmit={handleVacancySubmit}
              onEdit={(v: Vacancy) =>
                dispatch(setVacancyForm({ id: v.id, title: v.title, company: v.company, rawText: v.rawText }))
              }
              onDelete={async (id: string) => {
                if (!window.confirm("Удалить вакансию?")) return;
                await deleteVacancy(id);
                vacanciesQuery.refetch();
              }}
              onReload={() => vacanciesQuery.refetch()}
            />
          )}
          {tab === "match" && (
            <MatchView
              resumes={resumes}
              vacancies={vacancies}
              selectedResumeId={selectedResumeId}
              selectedVacancyId={selectedVacancyId}
              matchResult={matchState.data ?? null}
              matchLoading={matchState.isLoading}
              onChangeResume={(id) => dispatch(setSelectedResumeId(id))}
              onChangeVacancy={(id) => dispatch(setSelectedVacancyId(id))}
              onMatch={handleMatch}
            />
          )}
        </div>
      )}
    </>
  );
}

function regenerateCaptcha(dispatch: AppDispatch) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  const chars = text
    .split("")
    .map((char, index) => {
      const x = 16 + index * 28;
      const y = 38;
      return `<text x="${x}" y="${y}" fill="#1f2937" font-size="30" font-family="monospace" font-weight="700">${char}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect width="160" height="60" fill="#f8fafc"/>${chars}</svg>`;
  dispatch(
    setCaptchaData({
      captchaImage: `data:image/svg+xml;base64,${btoa(svg)}`,
      captchaExpected: text,
      captchaValue: "",
    })
  );
}


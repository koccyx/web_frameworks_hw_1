import { useEffect, useState } from "react";
import { authApi, resumesApi, vacanciesApi, matchApi, tokenStorage } from "./api";
import type { MatchResult, Resume, Vacancy, User } from "./types";
import { AuthView } from "./components/AuthView";
import { ResumesView } from "./components/ResumesView";
import { VacanciesView } from "./components/VacanciesView";
import { MatchView } from "./components/MatchView";

type Tab = "resumes" | "vacancies" | "match";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("resumes");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const [resumeForm, setResumeForm] = useState<{ id?: string; title: string; rawText: string }>({
    title: "",
    rawText: "",
  });
  const [vacancyForm, setVacancyForm] = useState<{
    id?: string;
    title: string;
    company: string;
    rawText: string;
  }>({
    title: "",
    company: "",
    rawText: "",
  });

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) return;
    authApi
      .me()
      .then((me) => {
        setUser(me);
        void loadData();
      })
      .catch(() => {
        tokenStorage.clear();
      });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, accessToken, refreshToken, user: u } = isRegister
        ? await authApi.register(email, password)
        : await authApi.login(email, password);
      tokenStorage.setTokens({ accessToken: accessToken ?? token, refreshToken });
      setUser(u);
      setEmail("");
      setPassword("");
      await loadData();
    } catch (err: unknown) {
      setError("Ошибка авторизации. Проверьте email/пароль.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setUser(null);
    setEmail("");
    setPassword("");
    setResumes([]);
    setVacancies([]);
    setMatchResult(null);
  };

  const loadData = async () => {
    try {
      const [r, v] = await Promise.all([resumesApi.list(), vacanciesApi.list()]);
      setResumes(r);
      setVacancies(v);
      if (r.length > 0) setSelectedResumeId(r[0].id);
      if (v.length > 0) setSelectedVacancyId(v[0].id);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить данные.");
    }
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (resumeForm.id) {
        const updated = await resumesApi.update(resumeForm.id, {
          title: resumeForm.title,
          rawText: resumeForm.rawText,
        });
        setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await resumesApi.create({
          title: resumeForm.title,
          rawText: resumeForm.rawText,
        });
        setResumes((prev) => [created, ...prev]);
      }
      setResumeForm({ title: "", rawText: "" });
    } catch (err) {
      console.error(err);
      setError("Не удалось сохранить резюме.");
    }
  };

  const handleResumeEdit = (resume: Resume) => {
    setResumeForm({
      id: resume.id,
      title: resume.title,
      rawText: resume.rawText,
    });
  };

  const handleResumeDelete = async (id: string) => {
    if (!window.confirm("Удалить резюме?")) return;
    try {
      await resumesApi.remove(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResumeId === id) {
        setSelectedResumeId(resumes[0]?.id ?? "");
      }
    } catch (err) {
      console.error(err);
      setError("Не удалось удалить резюме.");
    }
  };

  const handleVacancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (vacancyForm.id) {
        const updated = await vacanciesApi.update(vacancyForm.id, {
          title: vacancyForm.title,
          company: vacancyForm.company,
          rawText: vacancyForm.rawText,
        });
        setVacancies((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const created = await vacanciesApi.create({
          title: vacancyForm.title,
          company: vacancyForm.company,
          rawText: vacancyForm.rawText,
        });
        setVacancies((prev) => [created, ...prev]);
      }
      setVacancyForm({ title: "", company: "", rawText: "" });
    } catch (err) {
      console.error(err);
      setError("Не удалось сохранить вакансию.");
    }
  };

  const handleVacancyEdit = (vacancy: Vacancy) => {
    setVacancyForm({
      id: vacancy.id,
      title: vacancy.title,
      company: vacancy.company,
      rawText: vacancy.rawText,
    });
  };

  const handleVacancyDelete = async (id: string) => {
    if (!window.confirm("Удалить вакансию?")) return;
    try {
      await vacanciesApi.remove(id);
      setVacancies((prev) => prev.filter((v) => v.id !== id));
      if (selectedVacancyId === id) {
        setSelectedVacancyId(vacancies[0]?.id ?? "");
      }
    } catch (err) {
      console.error(err);
      setError("Не удалось удалить вакансию.");
    }
  };

  const handleMatch = async () => {
    if (!selectedResumeId || !selectedVacancyId) {
      setError("Выберите резюме и вакансию для сравнения.");
      return;
    }
    setError(null);
    setMatchResult(null);
    setMatchLoading(true);
    try {
      const result = await matchApi.match({
        resumeId: selectedResumeId,
        vacancyId: selectedVacancyId,
      });
      setMatchResult(result);
    } catch (err) {
      console.error(err);
      setError("Не удалось выполнить сравнение.");
    } finally {
      setMatchLoading(false);
    }
  };

  const isAuthenticated = Boolean(user);

  const me = user!;

  return !isAuthenticated ? (
    <AuthView
      email={email}
      password={password}
      isRegister={isRegister}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onToggleMode={() => setIsRegister((v) => !v)}
      onSubmit={handleAuth}
    />
  ) : (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-0">Вакансии от СТЕПАНА</h1>
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
          <button
            className={`nav-link ${tab === "resumes" ? "active" : ""}`}
            type="button"
            onClick={() => setTab("resumes")}
          >
            Резюме
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "vacancies" ? "active" : ""}`}
            type="button"
            onClick={() => setTab("vacancies")}
          >
            Вакансии
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "match" ? "active" : ""}`}
            type="button"
            onClick={() => setTab("match")}
          >
            Сопоставление
          </button>
        </li>
      </ul>

      {tab === "resumes" && (
        <ResumesView
          currentUserId={me.id}
          currentUserRole={me.role}
          resumes={resumes}
          resumeForm={resumeForm}
          onResumeFormChange={setResumeForm}
          onSubmit={handleResumeSubmit}
          onEdit={handleResumeEdit}
          onDelete={handleResumeDelete}
          onReload={loadData}
        />
      )}

      {tab === "vacancies" && (
        <VacanciesView
          currentUserId={me.id}
          currentUserRole={me.role}
          vacancies={vacancies}
          vacancyForm={vacancyForm}
          onVacancyFormChange={setVacancyForm}
          onSubmit={handleVacancySubmit}
          onEdit={handleVacancyEdit}
          onDelete={handleVacancyDelete}
          onReload={loadData}
        />
      )}

      {tab === "match" && (
        <MatchView
          resumes={resumes}
          vacancies={vacancies}
          selectedResumeId={selectedResumeId}
          selectedVacancyId={selectedVacancyId}
          matchResult={matchResult}
          matchLoading={matchLoading}
          onChangeResume={setSelectedResumeId}
          onChangeVacancy={setSelectedVacancyId}
          onMatch={handleMatch}
        />
      )}
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import { authApi, resumesApi, vacanciesApi, matchApi, tokenStorage } from "./api";
import type { MatchResult, Resume, Vacancy, User } from "./types";
import { AuthView } from "./components/AuthView";
import { ResumesView } from "./components/ResumesView";
import { VacanciesView } from "./components/VacanciesView";
import { MatchView } from "./components/MatchView";

type Tab = "resumes" | "vacancies" | "match";
type ThemeMode = "dark" | "light";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("user");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaExpected, setCaptchaExpected] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");

  const [tab, setTab] = useState<Tab>("resumes");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("themeMode");
    return stored === "light" ? "light" : "dark";
  });

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

  useEffect(() => {
    regenerateCaptcha();
  }, [isRegister]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("themeMode", theme);
  }, [theme]);

  const regenerateCaptcha = () => {
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

    setCaptchaImage(`data:image/svg+xml;base64,${btoa(svg)}`);
    setCaptchaExpected(text);
    setCaptchaValue("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaValue.trim().toUpperCase() !== captchaExpected) {
      setError("Неверно введена капча.");
      regenerateCaptcha();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, accessToken, refreshToken, user: u } = isRegister
        ? await authApi.register(email, password, role || "user")
        : await authApi.login(email, password);
      tokenStorage.setTokens({ accessToken: accessToken ?? token, refreshToken });
      setUser(u);
      setEmail("");
      setPassword("");
      setCaptchaValue("");
      regenerateCaptcha();
      await loadData();
    } catch (err: unknown) {
      setError("Ошибка авторизации. Проверьте email/пароль.");
      regenerateCaptcha();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setUser(null);
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
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <>
      <button className="btn btn-sm btn-outline-secondary theme-toggle-btn" type="button" onClick={toggleTheme}>
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      {!isAuthenticated ? (
        <AuthView
          email={email}
          password={password}
          role={role}
          isRegister={isRegister}
          loading={loading}
          error={error}
          captchaImage={captchaImage}
          captchaValue={captchaValue}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onCaptchaChange={setCaptchaValue}
          onRefreshCaptcha={regenerateCaptcha}
          onRoleChange={(value) => setRole(value)}
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
      )}
    </>
  );
}

export default App;

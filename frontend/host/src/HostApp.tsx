import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  AuthView,
  backendApi,
  generateCaptcha,
  tokenStorage,
  useAppDispatch,
  useLoginMutation,
  useMeQuery,
  useRegisterMutation,
} from "@mf/shared";

type Section = "catalog" | "matching";

const CatalogApp = lazy(() => import("mfCatalog/App"));
const MatchingApp = lazy(() => import("mfMatching/App"));

export function HostApp() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaExpected, setCaptchaExpected] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [section, setSection] = useState<Section>("catalog");
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const hasToken = Boolean(tokenStorage.getAccess());
  const meQuery = useMeQuery(undefined, { skip: !hasToken });
  const user = meQuery.data ?? null;

  const appLabel = "Вакансии от СТЕПАНА";

  const refreshCaptcha = () => {
    const next = generateCaptcha();
    setCaptchaExpected(next.expected);
    setCaptchaImage(next.image);
    setCaptchaValue("");
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    if (meQuery.isError) tokenStorage.clear();
  }, [meQuery.isError]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaValue.trim().toUpperCase() !== captchaExpected) {
      setError("Неверно введена капча.");
      refreshCaptcha();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password }).unwrap();
      } else {
        await login({ email, password }).unwrap();
      }
      setEmail("");
      setPassword("");
    } catch {
      setError(isRegister ? "Не удалось зарегистрироваться." : "Ошибка входа. Проверьте email и пароль.");
    } finally {
      setLoading(false);
      refreshCaptcha();
    }

    // Session/user request can briefly fail right after auth.
    // Do not treat this as invalid credentials.
    void meQuery.refetch().catch(() => undefined);
  };

  const handleLogout = () => {
    tokenStorage.clear();
    dispatch(backendApi.util.resetApiState());
    // Force a clean auth state transition in host + remotes.
    window.location.reload();
  };

  const CurrentRemote = useMemo(() => (section === "catalog" ? CatalogApp : MatchingApp), [section]);

  if (hasToken && meQuery.isLoading) {
    return <div className="container py-5"><div className="card"><div className="card-body">Проверка сессии...</div></div></div>;
  }

  if (!user) {
    return (
      <AuthView
        appLabel={appLabel}
        email={email}
        password={password}
        isRegister={isRegister}
        loading={loading}
        error={error}
        captchaImage={captchaImage}
        captchaValue={captchaValue}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onCaptchaChange={setCaptchaValue}
        onRefreshCaptcha={refreshCaptcha}
        onToggleMode={() => setIsRegister((prev) => !prev)}
        onSubmit={handleAuth}
      />
    );
  }

  return (
    <div className="container-fluid py-3">
      <header className="card mb-3 bg-dark">
        <div className="card-body d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div>
            <h1 className="h4 mb-0 text-white">{appLabel}</h1>
            <small className="text-white-50">Пользователь: {user.email}</small>
          </div>
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${section === "catalog" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSection("catalog")}
              type="button"
            >
              Резюме и вакансии
            </button>
            <button
              className={`btn btn-sm ${section === "matching" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSection("matching")}
              type="button"
            >
              Профиль и match
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={handleLogout} type="button">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main>
        {error && <div className="alert alert-danger">{error}</div>}
        <Suspense fallback={<div className="card"><div className="card-body">Загрузка microfrontend...</div></div>}>
          <CurrentRemote user={user} />
        </Suspense>
      </main>

      <footer className="card mt-3">
        <div className="card-body py-2 d-flex justify-content-between">
          <small className="text-muted">MBSTU, Web Frameworks Lab 4</small>
          <small className="text-muted">Module Federation + Webpack</small>
        </div>
      </footer>
    </div>
  );
}

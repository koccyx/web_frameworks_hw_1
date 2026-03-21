interface AuthViewProps {
  email: string;
  password: string;
  isRegister: boolean;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleMode: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthView({
  email,
  password,
  isRegister,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onToggleMode,
  onSubmit,
}: AuthViewProps) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-3 text-center">Вакансии от СТЕПАНА</h1>
              <p className="text-muted text-center mb-4">
                Войдите или зарегистрируйтесь, чтобы управлять резюме и вакансиями.
              </p>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit} autoComplete="off">
                <div className="mb-3">
                  <label className="form-label">Логин</label>
                  <input
                    type="text"
                    className="form-control"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {isRegister && (
                  <p className="text-muted small">Все новые аккаунты создаются с ролью user.</p>
                )}
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
                </button>
              </form>
              <hr className="my-4" />
              <button
                className="btn btn-link w-100 text-decoration-none"
                type="button"
                onClick={onToggleMode}
              >
                {isRegister ? "У меня уже есть аккаунт" : "Создать новый аккаунт"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

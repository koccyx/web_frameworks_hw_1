import type { User } from "../types";

interface AuthViewProps {
  email: string;
  password: string;
  role: User["role"];
  isRegister: boolean;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: User["role"]) => void;
  onToggleMode: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthView({
  email,
  password,
  role,
  isRegister,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
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
                  <label className="form-label">Email</label>
                  <input
                    type="email"
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
                  <div className="mb-3">
                    <label className="form-label">Роль</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => onRoleChange(e.target.value)}
                      required
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
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


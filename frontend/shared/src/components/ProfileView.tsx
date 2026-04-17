import type { User } from "../types";

interface ProfileViewProps {
  user: User;
  resumesCount: number;
  vacanciesCount: number;
}

export function ProfileView({ user, resumesCount, vacanciesCount }: ProfileViewProps) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="card profile-hero">
          <div className="card-body">
            <h2 className="h5 mb-1">Информация о пользователе</h2>
            <p className="text-muted mb-0">Данные аккаунта и сводка по вашим объектам.</p>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="card stat-card h-100">
          <div className="card-body">
            <div className="stat-label">Пользователь</div>
            <div className="stat-value">{user.email}</div>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="card stat-card h-100">
          <div className="card-body">
            <div className="stat-label">Роль</div>
            <div className="stat-value text-capitalize">{user.role}</div>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-2">
        <div className="card stat-card h-100">
          <div className="card-body">
            <div className="stat-label">Резюме</div>
            <div className="stat-value">{resumesCount}</div>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-2">
        <div className="card stat-card h-100">
          <div className="card-body">
            <div className="stat-label">Вакансии</div>
            <div className="stat-value">{vacanciesCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

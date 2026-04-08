import { observer } from "mobx-react-lite";
import { AuthView } from "../components/AuthView";
import { MatchView } from "../components/MatchView";
import { ProfileView } from "../components/ProfileView";
import { ResumesView } from "../components/ResumesView";
import { VacanciesView } from "../components/VacanciesView";
import { appStore } from "./appStore";

export const MobxApp = observer(function MobxApp() {
  const appLabel = "Вакансии от СТЕПАНА (MobX)";
  const s = appStore;
  const me = s.me;

  return (
    <>
      <button className="btn btn-sm btn-outline-secondary theme-toggle-btn" type="button" onClick={s.toggleTheme}>
        {s.theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      {!s.isAuthenticated || !me ? (
        <AuthView
          appLabel={appLabel}
          email={s.email}
          password={s.password}
          isRegister={s.isRegister}
          loading={s.loading}
          error={s.error}
          captchaImage={s.captchaImage}
          captchaValue={s.captchaValue}
          onEmailChange={(v) => (s.email = v)}
          onPasswordChange={(v) => (s.password = v)}
          onCaptchaChange={(v) => (s.captchaValue = v)}
          onRefreshCaptcha={s.regenerateCaptcha}
          onToggleMode={() => (s.isRegister = !s.isRegister)}
          onSubmit={s.handleAuth}
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
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={s.logout}>
                Выйти
              </button>
            </div>
          </div>

          {s.error && <div className="alert alert-danger">{s.error}</div>}

          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button className={`nav-link ${s.tab === "profile" ? "active" : ""}`} type="button" onClick={() => (s.tab = "profile")}>
                Профиль
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${s.tab === "resumes" ? "active" : ""}`} type="button" onClick={() => (s.tab = "resumes")}>
                Резюме
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${s.tab === "vacancies" ? "active" : ""}`} type="button" onClick={() => (s.tab = "vacancies")}>
                Вакансии
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${s.tab === "match" ? "active" : ""}`} type="button" onClick={() => (s.tab = "match")}>
                Сопоставление
              </button>
            </li>
          </ul>

          {s.tab === "profile" && <ProfileView user={me} resumesCount={s.resumes.length} vacanciesCount={s.vacancies.length} />}

          {s.tab === "resumes" && (
            <ResumesView
              currentUserId={me.id}
              currentUserRole={me.role}
              resumes={s.resumes}
              resumeForm={s.resumeForm}
              onResumeFormChange={(v) => (s.resumeForm = v)}
              onSubmit={s.submitResume}
              onEdit={s.editResume}
              onDelete={s.deleteResume}
              onReload={() => s.loadData(true)}
            />
          )}

          {s.tab === "vacancies" && (
            <VacanciesView
              currentUserId={me.id}
              currentUserRole={me.role}
              vacancies={s.vacancies}
              vacancyForm={s.vacancyForm}
              onVacancyFormChange={(v) => (s.vacancyForm = v)}
              onSubmit={s.submitVacancy}
              onEdit={s.editVacancy}
              onDelete={s.deleteVacancy}
              onReload={() => s.loadData(true)}
            />
          )}

          {s.tab === "match" && (
            <MatchView
              resumes={s.resumes}
              vacancies={s.vacancies}
              selectedResumeId={s.selectedResumeId}
              selectedVacancyId={s.selectedVacancyId}
              matchResult={s.matchResult}
              matchLoading={s.matchLoading}
              onChangeResume={(id) => (s.selectedResumeId = id)}
              onChangeVacancy={(id) => (s.selectedVacancyId = id)}
              onMatch={s.runMatch}
            />
          )}
        </div>
      )}
    </>
  );
});


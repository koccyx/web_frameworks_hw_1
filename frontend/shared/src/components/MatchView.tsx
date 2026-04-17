import type { MatchResult, Resume, Vacancy } from "../types";

interface MatchViewProps {
  resumes: Resume[];
  vacancies: Vacancy[];
  selectedResumeId: string;
  selectedVacancyId: string;
  matchResult: MatchResult | null;
  matchLoading: boolean;
  onChangeResume: (id: string) => void;
  onChangeVacancy: (id: string) => void;
  onMatch: () => void;
}

export function MatchView({
  resumes,
  vacancies,
  selectedResumeId,
  selectedVacancyId,
  matchResult,
  matchLoading,
  onChangeResume,
  onChangeVacancy,
  onMatch,
}: MatchViewProps) {
  return (
    <div className="row">
      <div className="col-md-4 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">Параметры сравнения</h2>
            <div className="mb-3">
              <label className="form-label">Резюме</label>
              <select
                className="form-select"
                value={selectedResumeId}
                onChange={(e) => onChangeResume(e.target.value)}
              >
                <option value="">Выберите резюме</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Вакансия</label>
              <select
                className="form-select"
                value={selectedVacancyId}
                onChange={(e) => onChangeVacancy(e.target.value)}
              >
                <option value="">Выберите вакансию</option>
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title} — {v.company}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary w-100" type="button" onClick={onMatch}>
              {matchLoading ? "Сравниваю..." : "Сравнить"}
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-8 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">Результат</h2>
            {matchLoading ? (
              <div className="d-flex align-items-center gap-2 text-muted">
                <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Готовлю результат...</span>
              </div>
            ) : !matchResult ? (
              <p className="text-muted mb-0">
                Выберите резюме и вакансию и нажмите &quot;Сравнить&quot;.
              </p>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="h6">Оценка совпадения</h3>
                  <div className="progress" style={{ height: "1.5rem" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${Math.round(matchResult.score * 100)}%` }}
                      aria-valuenow={Math.round(matchResult.score * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {Math.round(matchResult.score * 100)}%
                    </div>
                  </div>
                </div>
                {matchResult.overlapKeywords.length > 0 && (
                  <div className="mb-3">
                    <h3 className="h6">Пересекающиеся ключевые слова</h3>
                    <p>{matchResult.overlapKeywords.join(", ")}</p>
                  </div>
                )}
                {matchResult.missingKeywords.length > 0 && (
                  <div className="mb-3">
                    <h3 className="h6">Отсутствующие ключевые слова</h3>
                    <p>{matchResult.missingKeywords.join(", ")}</p>
                  </div>
                )}
                {matchResult.suggestions.length > 0 && (
                  <div className="mb-3">
                    <h3 className="h6">Рекомендации</h3>
                    <ul className="mb-0">
                      {matchResult.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.resumeImprovements && matchResult.resumeImprovements.length > 0 && (
                  <div>
                    <h3 className="h6">Как улучшить резюме</h3>
                    <ul className="mb-0">
                      {matchResult.resumeImprovements.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

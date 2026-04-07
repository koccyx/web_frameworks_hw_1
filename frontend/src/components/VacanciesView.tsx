import type { Vacancy } from "../types";

interface VacancyFormState {
  id?: string;
  title: string;
  company: string;
  rawText: string;
}

interface VacanciesViewProps {
  currentUserId: string;
  currentUserRole: "user" | "admin";
  vacancies: Vacancy[];
  vacancyForm: VacancyFormState;
  onVacancyFormChange: (value: VacancyFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (vacancy: Vacancy) => void;
  onDelete: (id: string) => void;
  onReload: () => void;
}

export function VacanciesView({
  currentUserId,
  currentUserRole,
  vacancies,
  vacancyForm,
  onVacancyFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onReload,
}: VacanciesViewProps) {
  const canManageVacancy = (vacancy: Vacancy) =>
    currentUserRole === "admin" || vacancy.userId === currentUserId;

  return (
    <div className="row">
      <div className="col-md-5 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">
              {vacancyForm.id ? "Редактировать вакансию" : "Новая вакансия"}
            </h2>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Заголовок</label>
                <input
                  className="form-control"
                  value={vacancyForm.title}
                  onChange={(e) =>
                    onVacancyFormChange({
                      ...vacancyForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Компания</label>
                <input
                  className="form-control"
                  value={vacancyForm.company}
                  onChange={(e) =>
                    onVacancyFormChange({
                      ...vacancyForm,
                      company: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Текст вакансии</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={vacancyForm.rawText}
                  onChange={(e) =>
                    onVacancyFormChange({
                      ...vacancyForm,
                      rawText: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  {vacancyForm.id ? "Сохранить" : "Создать"}
                </button>
                {vacancyForm.id && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() =>
                      onVacancyFormChange({
                        title: "",
                        company: "",
                        rawText: "",
                      })
                    }
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-7 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Все вакансии</h2>
              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onReload}>
                Обновить
              </button>
            </div>
            {vacancies.length === 0 ? (
              <p className="text-muted mb-0">Вакансий пока нет.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Заголовок</th>
                      <th>Компания</th>
                      <th>Создано</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacancies.map((v) => (
                      <tr key={v.id}>
                        <td>{v.title}</td>
                        <td>{v.company}</td>
                        <td>{new Date(v.createdAt).toLocaleString()}</td>
                        <td className="text-end">
                          {canManageVacancy(v) ? (
                            <div className="btn-group-vertical" role="group" aria-label="Vacancy actions">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                type="button"
                                onClick={() => onEdit(v)}
                              >
                                Редактировать
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                type="button"
                                onClick={() => onDelete(v.id)}
                              >
                                Удалить
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">Только просмотр</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

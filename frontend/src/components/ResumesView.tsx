import type { Resume } from "../types";

interface ResumeFormState {
  id?: string;
  title: string;
  rawText: string;
}

interface ResumesViewProps {
  resumes: Resume[];
  resumeForm: ResumeFormState;
  onResumeFormChange: (value: ResumeFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (resume: Resume) => void;
  onDelete: (id: string) => void;
  onReload: () => void;
}

export function ResumesView({
  resumes,
  resumeForm,
  onResumeFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onReload,
}: ResumesViewProps) {
  return (
    <div className="row">
      <div className="col-md-5 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">{resumeForm.id ? "Редактировать резюме" : "Новое резюме"}</h2>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Заголовок</label>
                <input
                  className="form-control"
                  value={resumeForm.title}
                  onChange={(e) =>
                    onResumeFormChange({
                      ...resumeForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Текст резюме</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={resumeForm.rawText}
                  onChange={(e) =>
                    onResumeFormChange({
                      ...resumeForm,
                      rawText: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  {resumeForm.id ? "Сохранить" : "Создать"}
                </button>
                {resumeForm.id && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() =>
                      onResumeFormChange({
                        title: "",
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
              <h2 className="h5 mb-0">Мои резюме</h2>
              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onReload}>
                Обновить
              </button>
            </div>
            {resumes.length === 0 ? (
              <p className="text-muted mb-0">Резюме пока нет.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Заголовок</th>
                      <th>Создано</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumes.map((r) => (
                      <tr key={r.id}>
                        <td>{r.title}</td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="text-end">
                          <div className="btn-group-vertical" role="group" aria-label="Resume actions">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              type="button"
                              onClick={() => onEdit(r)}
                            >
                              Редактировать
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              type="button"
                              onClick={() => onDelete(r.id)}
                            >
                              Удалить
                            </button>
                          </div>
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


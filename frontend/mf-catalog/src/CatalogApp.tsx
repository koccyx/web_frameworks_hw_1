import { useState } from "react";
import {
  ResumesView,
  VacanciesView,
  useCreateResumeMutation,
  useCreateVacancyMutation,
  useDeleteResumeMutation,
  useDeleteVacancyMutation,
  useResumesQuery,
  useUpdateResumeMutation,
  useUpdateVacancyMutation,
  useVacanciesQuery,
} from "@mf/shared";
import type { ResumeFormState, User, VacancyFormState } from "@mf/shared";

interface CatalogAppProps {
  user: User;
}

export default function CatalogApp({ user }: CatalogAppProps) {
  const [tab, setTab] = useState<"resumes" | "vacancies">("resumes");
  const [error, setError] = useState<string | null>(null);
  const [resumeForm, setResumeForm] = useState<ResumeFormState>({ title: "", rawText: "" });
  const [vacancyForm, setVacancyForm] = useState<VacancyFormState>({ title: "", company: "", rawText: "" });
  const resumesQuery = useResumesQuery();
  const vacanciesQuery = useVacanciesQuery();
  const [createResume] = useCreateResumeMutation();
  const [updateResume] = useUpdateResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [createVacancy] = useCreateVacancyMutation();
  const [updateVacancy] = useUpdateVacancyMutation();
  const [deleteVacancy] = useDeleteVacancyMutation();
  const resumes = resumesQuery.data ?? [];
  const vacancies = vacanciesQuery.data ?? [];

  const saveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (resumeForm.id) {
        await updateResume({ id: resumeForm.id, payload: { title: resumeForm.title, rawText: resumeForm.rawText } }).unwrap();
      } else {
        await createResume({ title: resumeForm.title, rawText: resumeForm.rawText }).unwrap();
      }
      setResumeForm({ title: "", rawText: "" });
    } catch {
      setError("Не удалось сохранить резюме.");
    }
  };

  const saveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (vacancyForm.id) {
        await updateVacancy({
          id: vacancyForm.id,
          payload: {
          title: vacancyForm.title,
          company: vacancyForm.company,
          rawText: vacancyForm.rawText,
          },
        }).unwrap();
      } else {
        await createVacancy({
          title: vacancyForm.title,
          company: vacancyForm.company,
          rawText: vacancyForm.rawText,
        }).unwrap();
      }
      setVacancyForm({ title: "", company: "", rawText: "" });
    } catch {
      setError("Не удалось сохранить вакансию.");
    }
  };

  return (
    <div>
      {(error || resumesQuery.isError || vacanciesQuery.isError) && (
        <div className="alert alert-danger">{error ?? "Не удалось загрузить данные каталога."}</div>
      )}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === "resumes" ? "active" : ""}`} onClick={() => setTab("resumes")} type="button">
            Резюме
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "vacancies" ? "active" : ""}`} onClick={() => setTab("vacancies")} type="button">
            Вакансии
          </button>
        </li>
      </ul>

      {tab === "resumes" ? (
        <ResumesView
          currentUserId={user.id}
          currentUserRole={user.role}
          resumes={resumes}
          resumeForm={resumeForm}
          onResumeFormChange={setResumeForm}
          onSubmit={saveResume}
          onEdit={(r) => setResumeForm({ id: r.id, title: r.title, rawText: r.rawText })}
          onDelete={async (id) => {
            if (!window.confirm("Удалить резюме?")) return;
            await deleteResume(id).unwrap();
          }}
          onReload={() => {
            void resumesQuery.refetch();
            void vacanciesQuery.refetch();
          }}
        />
      ) : (
        <VacanciesView
          currentUserId={user.id}
          currentUserRole={user.role}
          vacancies={vacancies}
          vacancyForm={vacancyForm}
          onVacancyFormChange={setVacancyForm}
          onSubmit={saveVacancy}
          onEdit={(v) => setVacancyForm({ id: v.id, title: v.title, company: v.company, rawText: v.rawText })}
          onDelete={async (id) => {
            if (!window.confirm("Удалить вакансию?")) return;
            await deleteVacancy(id).unwrap();
          }}
          onReload={() => {
            void resumesQuery.refetch();
            void vacanciesQuery.refetch();
          }}
        />
      )}
    </div>
  );
}

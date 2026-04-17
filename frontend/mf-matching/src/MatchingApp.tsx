import { useEffect, useState } from "react";
import { MatchView, ProfileView, useMeQuery, useResumesQuery, useRunMatchMutation, useVacanciesQuery } from "@mf/shared";
import type { MatchResult, User } from "@mf/shared";

interface MatchingAppProps {
  user: User;
}

export default function MatchingApp({ user }: MatchingAppProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedVacancyId, setSelectedVacancyId] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const meQuery = useMeQuery();
  const resumesQuery = useResumesQuery();
  const vacanciesQuery = useVacanciesQuery();
  const [runMatch, matchState] = useRunMatchMutation();
  const resumes = resumesQuery.data ?? [];
  const vacancies = vacanciesQuery.data ?? [];
  const actualUser = meQuery.data ?? user;

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) setSelectedResumeId(resumes[0].id);
  }, [resumes, selectedResumeId]);

  useEffect(() => {
    if (vacancies.length > 0 && !selectedVacancyId) setSelectedVacancyId(vacancies[0].id);
  }, [vacancies, selectedVacancyId]);

  const runMatching = async () => {
    if (!selectedResumeId || !selectedVacancyId) {
      setError("Выберите резюме и вакансию.");
      return;
    }
    setError(null);
    try {
      const result = await runMatch({ resumeId: selectedResumeId, vacancyId: selectedVacancyId }).unwrap();
      setMatchResult(result);
    } catch {
      setError("Сервис сравнения недоступен.");
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {(error || resumesQuery.isError || vacanciesQuery.isError) && (
        <div className="alert alert-danger mb-0">{error ?? "Не удалось загрузить данные для сопоставления."}</div>
      )}
      <ProfileView user={actualUser} resumesCount={resumes.length} vacanciesCount={vacancies.length} />
      <MatchView
        resumes={resumes}
        vacancies={vacancies}
        selectedResumeId={selectedResumeId}
        selectedVacancyId={selectedVacancyId}
        matchResult={matchResult}
        matchLoading={matchState.isLoading}
        onChangeResume={setSelectedResumeId}
        onChangeVacancy={setSelectedVacancyId}
        onMatch={runMatching}
      />
    </div>
  );
}

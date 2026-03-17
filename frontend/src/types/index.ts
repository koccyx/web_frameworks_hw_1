export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: User;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vacancy {
  id: string;
  userId: string;
  title: string;
  company: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  score: number;
  missingKeywords: string[];
  overlapKeywords: string[];
  suggestions: string[];
  resumeImprovements?: string[];
}

export interface MatchRequest {
  resumeId: string;
  vacancyId: string;
}


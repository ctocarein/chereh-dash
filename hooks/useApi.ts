import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, QuestionTemplate, EvaluationSession, Ambassador, Referral, RiskModel, ModelVersion, ThematicBloc, QuestionGroup, Identity } from "@/types";

// --- Identity / Patients ---
export function useIdentities(page = 1) {
  return useQuery<PaginatedResponse<Identity>>({
    queryKey: ["identities", page],
    queryFn: () => apiClient.get(`/identity?page=${page}`).then((r) => r.data),
  });
}

// --- Ambassadeurs ---
export function useAmbassadorMetrics() {
  return useQuery({
    queryKey: ["ambassador", "metrics"],
    queryFn: () => apiClient.get("/ambassador/metrics").then((r) => r.data),
  });
}

export function useReferrals() {
  return useQuery<Referral[]>({
    queryKey: ["referrals"],
    queryFn: () => apiClient.get("/ambassador/referrals").then((r) => r.data.data ?? r.data),
  });
}

// --- Evaluations (admin) ---
export function useAdminSessions(page = 1) {
  return useQuery<PaginatedResponse<EvaluationSession>>({
    queryKey: ["admin", "sessions", page],
    queryFn: () => apiClient.get(`/admin/sessions?page=${page}`).then((r) => r.data),
  });
}

// --- Questions ---
export function useQuestions(page = 1) {
  return useQuery<PaginatedResponse<QuestionTemplate>>({
    queryKey: ["admin", "questions", page],
    queryFn: () => apiClient.get(`/admin/questions?page=${page}`).then((r) => r.data),
  });
}

export function useToggleQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.patch(`/admin/questions/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "questions"] }),
  });
}

// --- Question Groups ---
export function useQuestionGroups() {
  return useQuery<PaginatedResponse<QuestionGroup>>({
    queryKey: ["admin", "question-groups"],
    queryFn: () => apiClient.get("/admin/question-groups").then((r) => r.data),
  });
}

// --- Thematic Blocs ---
export function useThematicBlocs() {
  return useQuery<PaginatedResponse<ThematicBloc>>({
    queryKey: ["admin", "thematic-blocs"],
    queryFn: () => apiClient.get("/admin/thematic-blocs").then((r) => r.data),
  });
}

// --- Risk Models ---
export function useRiskModels() {
  return useQuery<PaginatedResponse<RiskModel>>({
    queryKey: ["admin", "risk-models"],
    queryFn: () => apiClient.get("/admin/risk-models").then((r) => r.data),
  });
}

// --- Model Versions ---
export function useModelVersions() {
  return useQuery<PaginatedResponse<ModelVersion>>({
    queryKey: ["admin", "model-versions"],
    queryFn: () => apiClient.get("/admin/model-versions").then((r) => r.data),
  });
}

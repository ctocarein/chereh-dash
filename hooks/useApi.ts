import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, QuestionTemplate, EvaluationSession, Ambassador, Referral, RiskModel, ModelVersion, ThematicBloc, QuestionGroup, Identity } from "@/types";

// --- OrgManager: Mon organisation ---
export function useMyOrganization() {
  return useQuery({
    queryKey: ["org", "my-organization"],
    queryFn: () =>
      apiClient.get("/organizations?per_page=1").then((r) => {
        const items = r.data?.data ?? r.data?.organizations ?? [];
        return Array.isArray(items) ? items[0] ?? null : null;
      }),
  });
}

// --- Admin: Organisations ---
export function useOrganizations(page = 1, search = "", status = "") {
  return useQuery({
    queryKey: ["admin", "organizations", page, search, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (search) params.set("name", search);
      if (status) params.set("status", status);
      return apiClient.get(`/organizations?${params}`).then((r) => r.data);
    },
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; plan?: string; status?: string; name?: string; type?: string }) =>
      apiClient.patch(`/organizations/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "organizations"] }),
  });
}

// --- OrgManager: Patients (Beneficiary | Ambassador | AgentField scoped to org) ---
export function useOrgPatients(page = 1, search = "", commune = "", role = "") {
  return useQuery({
    queryKey: ["org", "patients", page, search, commune, role],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (search)  params.set("search",  search);
      if (commune) params.set("commune", commune);
      if (role)    params.set("role",    role);
      return apiClient.get(`/admin/patients?${params}`).then((r) => r.data);
    },
  });
}

// --- OrgManager: Utilisateurs (Practitioner / FieldAgent) ---
export function useOrgUsers(role = "", page = 1, search = "") {
  return useQuery({
    queryKey: ["org", "users", role, page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (role)   params.set("role",   role);
      if (search) params.set("search", search);
      return apiClient.get(`/admin/users?${params}`).then((r) => r.data);
    },
  });
}

// --- OrgManager: User provisioning ---
export function useCreatePractitioner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; first_name?: string; last_name?: string }) =>
      apiClient.post("/admin/users/practitioner", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "users"] }),
  });
}

export function useCreateFieldAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone: string; first_name?: string; last_name?: string }) =>
      apiClient.post("/admin/users/field-agent", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "users"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { password: string; password_confirmation: string }) =>
      apiClient.patch("/admin/users/change-password", data).then((r) => r.data),
  });
}

// --- OrgManager: Triage Stats (cancer/age/commune analytics) ---
export function useOrgTriageStats() {
  return useQuery({
    queryKey: ["org", "triage-stats"],
    queryFn: () => apiClient.get("/admin/triage/stats").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// --- OrgManager: Decision Insights ---
export function useOrgDecisions(page = 1, riskLevel = "") {
  return useQuery({
    queryKey: ["org", "decisions", page, riskLevel],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (riskLevel) params.set("risk_level", riskLevel);
      return apiClient.get(`/admin/decisions?${params}`).then((r) => r.data);
    },
  });
}

export function useOrgDecisionStats() {
  return useQuery({
    queryKey: ["org", "decision-stats"],
    queryFn: () => apiClient.get("/admin/decisions/stats").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// --- Identity / Patients ---
export function useIdentities(page = 1) {
  return useQuery<PaginatedResponse<Identity>>({
    queryKey: ["identities", page],
    queryFn: () => apiClient.get(`/identity?page=${page}`).then((r) => r.data),
  });
}

export function useIdentityPhoneSearch(phone: string) {
  return useQuery<PaginatedResponse<Identity & { _phone?: string }>>({
    queryKey: ["identities", "phone", phone],
    queryFn: () => apiClient.get(`/identity?phone=${encodeURIComponent(phone)}&per_page=20`).then((r) => r.data),
    enabled: phone.trim().length >= 3,
  });
}

// --- Onboarding requests (admin) ---
export function useOnboardingRequests(status?: string, page = 1) {
  return useQuery({
    queryKey: ["admin", "onboarding-requests", status, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      return apiClient.get(`/identity/onboard/requests?${params}`).then((r) => r.data);
    },
  });
}

export function useApproveOnboardingRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/identity/onboard/requests/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "onboarding-requests"] }),
  });
}

export function useRejectOnboardingRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason_code, reason_detail }: { id: number; reason_code: string; reason_detail?: string }) =>
      apiClient.post(`/identity/onboard/requests/${id}/reject`, { reason_code, reason_detail }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "onboarding-requests"] }),
  });
}

// --- Ambassadeurs ---
export function useAdminAmbassadors(page = 1) {
  return useQuery({
    queryKey: ["admin", "ambassadors", page],
    queryFn: () => apiClient.get(`/ambassador/admin/list?page=${page}`).then((r) => r.data),
  });
}

export function useActivateAmbassador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ identity_id, organization_id }: { identity_id: string; organization_id?: string }) =>
      apiClient.post("/ambassador/activate", { identity_id, organization_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "ambassadors"] }),
  });
}

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

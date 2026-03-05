// --- Auth ---
export interface Membership {
  id: string;
  identity_id: string;
  organization_id: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface Identity {
  id: string;
  kind: string;
  status: string;
  memberships?: Membership[];
  created_at?: string;
  updated_at?: string;
  // Champs dénormalisés côté front (non fournis par l'API, enrichis au login)
  _email?: string;
}

export interface SecurityGate {
  state: "entry" | "limited" | "full" | "locked";
  gate_required: boolean;
  locked_until: string | null;
  panic_locked_at: string | null;
  device_trusted: boolean;
}

export interface AuthResponse {
  token: string;
  identity: Identity;
  security_gate: SecurityGate;
}

/** Extrait le premier rôle actif d'une identity */
export function getPrimaryRole(identity: Identity): string {
  return identity.memberships?.find((m) => m.status === "active")?.role ?? "—";
}

// --- Patient ---
export interface Patient {
  uuid: string;
  identity_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// --- Ambassador ---
export interface Ambassador {
  uuid: string;
  identity_uuid: string;
  first_name: string;
  last_name: string;
  level: string;
  is_active: boolean;
  referral_count: number;
  created_at: string;
}

export interface AmbassadorMetrics {
  referrals_total: number;
  referrals_used: number;
  referrals_pending: number;
  level: string;
  badges: AmbassadorBadge[];
}

export interface AmbassadorBadge {
  key: string;
  label: string;
  earned_at: string;
}

export interface Referral {
  uuid: string;
  code: string;
  status: "pending" | "used" | "expired" | "revoked";
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
}

// --- Evaluation ---
export interface EvaluationSession {
  uuid: string;
  identity_uuid?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  score: number | null;
  risk_zone: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// --- Questionnaire ---
export interface QuestionTemplate {
  id: number;
  key: string;
  label: string;
  type: "boolean" | "choice" | "scale" | "text";
  is_active: boolean;
  risk_weight: number | null;
  routing_rules: Record<string, unknown> | null;
  visible_if: Record<string, unknown> | null;
  created_at: string;
}

export interface QuestionGroup {
  id: number;
  key: string;
  label: string;
  is_active: boolean;
  order: number;
  questions: QuestionTemplate[];
}

export interface ThematicBloc {
  id: number;
  key: string;
  label: string;
  is_active: boolean;
  order: number;
}

// --- Risk model ---
export interface RiskModel {
  id: number;
  key: string;
  name: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export interface RiskSignal {
  id: number;
  key: string;
  label: string;
  weight: number;
}

export interface RiskFlag {
  id: number;
  key: string;
  label: string;
  severity: "low" | "moderate" | "high" | "critical";
  condition: Record<string, unknown>;
}

export interface ModelVersion {
  id: number;
  name: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

// --- Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

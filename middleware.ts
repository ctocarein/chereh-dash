import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/admin/login"];
const PUBLIC_PREFIXES = ["/onboard", "/verify-email"];

function getAuthState(request: NextRequest): { isAuthenticated: boolean; role: string | null } {
  const authStorage = request.cookies.get("chereh-auth");
  if (!authStorage) return { isAuthenticated: false, role: null };
  try {
    const raw    = decodeURIComponent(authStorage.value);
    const parsed = JSON.parse(raw);
    const isAuthenticated = Boolean(parsed?.state?.isAuthenticated);
    const memberships: Array<{ status: string; role: string }> = parsed?.state?.identity?.memberships ?? [];
    const role = memberships.find((m) => m.status === "active")?.role ?? null;
    return { isAuthenticated, role };
  } catch {
    return { isAuthenticated: false, role: null };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, role } = getAuthState(request);

  // Utilisateur déjà connecté → rediriger selon le rôle
  if ((pathname === "/login" || pathname === "/admin/login") && isAuthenticated) {
    const dest = role === "PlatformAdmin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Routes publiques exactes ou par préfixe : laisser passer
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) return NextResponse.next();

  // Routes protégées : rediriger vers /login si non connecté
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];

function getAuthState(request: NextRequest): { isAuthenticated: boolean; token: string | null } {
  const authStorage = request.cookies.get("chereh-auth");
  if (!authStorage) return { isAuthenticated: false, token: null };
  try {
    const raw = decodeURIComponent(authStorage.value);
    const parsed = JSON.parse(raw);
    const isAuthenticated = Boolean(parsed?.state?.isAuthenticated);
    const token = parsed?.state?.token ?? null;
    return { isAuthenticated, token };
  } catch {
    return { isAuthenticated: false, token: null };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated } = getAuthState(request);

  // Utilisateur déjà connecté → /login redirige vers /dashboard
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Routes publiques : laisser passer
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);
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

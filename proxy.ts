import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Esta función se ejecuta ANTES de que cualquier página cargue,
// para las rutas definidas en el `config.matcher` de abajo.
export function proxy(request: NextRequest) {
  // Leemos la cookie "token" que guardamos al hacer login
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // --- Rutas que requieren estar logueado ---
  // Si no hay token, mandamos al login
  const protectedRoutes = ["/cart", "/checkout", "/orders"];
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // --- Rutas de admin
  // Si no hay token, mandamos al home
  // (si hay token pero no es ADMIN, el backend rechazará los requests con 403)
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Rutas de auth (login y registro) --
  // Si ya está logueado y trata de entrar al login/registro, lo mandamos al home
  const authRoutes = ["/auth/login", "/auth/register"];
  if (authRoutes.some((route) => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si ninguna condición aplica, dejamos pasar el request normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};

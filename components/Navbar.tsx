"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, isAuthenticated, logout, token, loadUser } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Cuando el componente monta en el cliente, si hay token guardado
  // pero el usuario no está cargado (pasa al recargar la página),
  // llamamos a loadUser() que hace GET /api/auth/me y restaura el estado.
  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold hover:text-green-600 transition">
            GeekShop
          </Link>

          {/* Links del centro */}
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-green-600 transition">
              Productos
            </Link>
          </div>

          {/* Lado derecho */}
          <div className="flex items-center gap-4">

            {/* Ícono del carrito con badge */}
            <Link href="/cart" className="relative hover:text-green-600 transition">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                />
              </svg>

              {/* Badge — solo después de montar en el cliente */}
              {mounted && totalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems() > 9 ? "9+" : totalItems()}
                </span>
              )}
            </Link>

            {/* Auth — solo después de montar */}
            {!mounted ? (
              // Placeholder mientras carga, para evitar layout shift
              <div className="w-24 h-6" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hola, <strong>{user.firstName}</strong>
                </span>
                <Link
                  href="/orders"
                  className="text-sm hover:text-green-600 transition"
                >
                  Mis pedidos
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex gap-3 text-sm">
                <Link href="/auth/login" className="hover:text-green-600 transition">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                >
                  Registrarse
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
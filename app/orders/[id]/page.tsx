"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { OrderResponse } from "@/types";

// Mismo mapeo de estados que en la lista de pedidos
const STATUS_CONFIG: Record<
  OrderResponse["status"],
  { label: string; className: string }
> = {
  PENDING:   { label: "Pendiente",  className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-100 text-blue-800"   },
  SHIPPED:   { label: "Enviado",    className: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Entregado",  className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelado",  className: "bg-red-100 text-red-800"     },
};

export default function OrderDetailPage() {
  // useParams() es el hook de Next.js que nos da los parámetros de la URL.
  // Como esta página está en /orders/[id]/page.tsx, params.id va a tener
  // el valor real que viene en la URL, por ejemplo "a3f2b1c4-...".
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get<OrderResponse>(`/orders/${id}`);
        setOrder(data);
      } catch (error: unknown) {
        // Si el backend responde 404 (pedido no existe o no es del usuario),
        // mostramos una pantalla de "no encontrado" en vez de un error genérico
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error("Error al cargar pedido:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Formatea una fecha ISO a algo legible: "9 de abril de 2026, 21:30"
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Cargando pedido...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
        <p className="text-gray-500 mb-6">
          Este pedido no existe o no pertenece a tu cuenta.
        </p>
        <Link
          href="/orders"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
        >
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status];

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Navegación hacia atrás */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1 transition"
      >
        ← Volver
      </button>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Columna izquierda: productos ── */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <div className="border rounded-lg divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex justify-between items-start gap-4">

                {/* Info del producto */}
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {/* Mostramos la variante solo si el pedido la tenía guardada */}
                  {item.size && item.color && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {item.size} / {item.color}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    ${item.unitPrice.toLocaleString()} × {item.quantity}
                  </p>
                </div>

                {/* Subtotal del item */}
                <p className="font-semibold text-right">
                  ${item.subtotal.toLocaleString()}
                </p>

              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <span className="text-gray-500 text-sm">Total del pedido</span>
              <p className="text-2xl font-bold text-green-600">
                ${order.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Columna derecha: datos de envío ── */}
        <div className="lg:w-72">
          <div className="border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Datos de envío</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-1">
                  Dirección
                </p>
                <p>{order.shippingAddress}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-1">
                  Ciudad
                </p>
                <p>{order.city}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-1">
                  Teléfono
                </p>
                <p>{order.phone}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

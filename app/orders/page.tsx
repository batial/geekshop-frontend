"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { OrderResponse, Page } from "@/types";

// Mapeo de estados a texto en español y colores de Tailwind
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Page<OrderResponse>>("/orders/my", {
        params: { page: currentPage, size: 10 },
      });
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

      {isLoading ? (
        <p className="text-gray-500 text-center py-12">Cargando pedidos...</p>

      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Todavía no hiciste ningún pedido.</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
          >
            Ver productos
          </Link>
        </div>

      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status];

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="border rounded-lg p-5 hover:shadow-md transition cursor-pointer">
                    <div className="flex items-start justify-between gap-4">

                      {/* Info del pedido */}
                      <div>
                        {/* Mostramos solo los primeros 8 caracteres del UUID
                            para que sea más legible, ej: "Pedido #a3f2b1c4" */}
                        <p className="font-semibold text-lg">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const totalUnits = order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            );
                            return `${totalUnits} ${totalUnits === 1 ? "unidad" : "unidades"}`;
                          })()}
                        </p>
                      </div>

                      {/* Estado + total */}
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <p className="font-bold text-lg mt-2">
                          ${order.total.toLocaleString()}
                        </p>
                      </div>

                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

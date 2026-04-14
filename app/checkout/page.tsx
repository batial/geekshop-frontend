"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import type { OrderResponse } from "@/types";

// ─── Esquema de validación ────────────────────────────────────────────────────
// Zod define las reglas de cada campo. Si algo no cumple la regla,
// genera el mensaje de error que le pasamos como parámetro.

const checkoutSchema = z.object({
  shippingAddress: z
    .string()
    .min(5, "Ingresá una dirección válida (mínimo 5 caracteres)"),

  city: z
    .string()
    .min(2, "Ingresá una ciudad válida"),

  phone: z
    .string()
    .regex(
      /^\+598 9\d{7}$/,
      "Formato inválido. Debe ser +598 9 seguido de 7 dígitos"
    ),
});

// z.infer genera el tipo TypeScript automáticamente a partir del schema.
// Es equivalente a escribir: { shippingAddress: string; city: string; phone: string }
// pero sin tener que repetirlo a mano.
type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Configuramos React Hook Form con el resolver de Zod.
  // El resolver es el "puente" entre Zod y React Hook Form —
  // le dice a RHF cómo usar las reglas del schema.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      // El teléfono ya viene precargado con el prefijo uruguayo.
      // El usuario solo tiene que escribir los 7 dígitos restantes.
      phone: "+598 9",
    },
  });

  // Si el carrito está vacío, no tiene sentido estar en esta página
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No tenés productos en el carrito</h1>
        <button
          onClick={() => router.push("/products")}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
        >
          Ver productos
        </button>
      </div>
    );
  }

  // Esta función se ejecuta SOLO si Zod validó todos los campos correctamente.
  // Si hay errores, handleSubmit los muestra y no llega acá.
  const onSubmit = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Transformamos los items del carrito al formato que espera el backend
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId,   // null si no tiene variantes
        quantity: item.quantity,
      }));

      const { data } = await api.post<OrderResponse>("/orders", {
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        phone: formData.phone,
        items: orderItems,
      });

      // Orden creada exitosamente — limpiamos el carrito y
      // llevamos al usuario a ver el detalle de su pedido
      clearCart();
      router.push(`/orders/${data.id}`);

    } catch (error: unknown) {
      // Si el backend devuelve un error (ej: sin stock), lo mostramos
      const axiosError = error as { response?: { data?: { message?: string } } };
      setServerError(
        axiosError?.response?.data?.message ||
        "Hubo un error al procesar tu pedido. Intentá de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Formulario de envío ── */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Datos de envío</h2>

          {/* handleSubmit intercepta el submit del form:
              primero valida con Zod, y solo si todo está bien llama a onSubmit */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Dirección
              </label>
              {/* register("shippingAddress") conecta este input con el campo
                  "shippingAddress" del schema. RHF escucha los cambios automáticamente. */}
              <input
                {...register("shippingAddress")}
                type="text"
                placeholder="Ej: Av. 18 de Julio 1234 apto 5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.shippingAddress ? "border-red-400" : "border-gray-300"
                }`}
              />
              {/* errors.shippingAddress existe solo si Zod encontró un error en ese campo */}
              {errors.shippingAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.shippingAddress.message}
                </p>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Ciudad
              </label>
              <input
                {...register("city")}
                type="text"
                placeholder="Ej: Montevideo"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.city ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Teléfono de contacto
              </label>
              <input
                {...register("phone")}
                type="text"
                maxLength={13}  // "+598 9" (6 chars) + 7 dígitos = 13 chars en total
                placeholder="+598 9XXXXXXX"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono ${
                  errors.phone ? "border-red-400" : "border-gray-300"
                }`}
              />
              <p className="text-gray-400 text-xs mt-1">
                Formato: +598 9 seguido de 7 dígitos
              </p>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Error del servidor (ej: sin stock) */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Procesando..." : "Confirmar pedido"}
            </button>

          </form>
        </div>

        {/* ── Resumen del pedido ── */}
        <div className="lg:w-80">
          <div className="border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Tu pedido</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const key = item.variantId
                  ? `${item.product.id}-${item.variantId}`
                  : item.product.id;

                return (
                  <div key={key} className="flex justify-between text-sm">
                    <div className="flex-1 pr-2">
                      <p className="font-medium">{item.product.name}</p>
                      {item.size && item.color && (
                        <p className="text-gray-400">
                          {item.size} / {item.color}
                        </p>
                      )}
                      <p className="text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">
                  ${totalPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

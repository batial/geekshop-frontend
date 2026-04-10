"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Cargando carrito...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">
          Todavía no agregaste ningún producto.
        </p>
        <Link
          href="/products"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition font-semibold"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Lista de items ── */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const key = item.variantId
              ? `${item.product.id}-${item.variantId}`
              : item.product.id;

            const mainImage =
              item.product.images?.find((img) => img.isMain) ||
              item.product.images?.[0];

            return (
              <div
                key={key}
                className="flex gap-4 border rounded-lg p-4 items-start"
              >
                {/* Imagen */}
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mainImage.url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info del producto */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>

                  {/* Talle y color (solo si tiene variante) */}
                  {item.size && item.color && (
                    <p className="text-sm text-gray-500 mt-1">
                      Talle: <strong>{item.size}</strong> · Color: <strong>{item.color}</strong>
                    </p>
                  )}

                  <p className="text-sm text-gray-400">{item.product.categoryName}</p>

                  {/* Precio unitario */}
                  <p className="text-green-600 font-medium mt-1">
                    ${item.unitPrice.toLocaleString()} c/u
                  </p>
                </div>

                {/* Controles de cantidad + eliminar */}
                <div className="flex flex-col items-end gap-3">
                  {/* Selector de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.variantId, item.quantity - 1)
                      }
                      className="w-8 h-8 border rounded-md hover:bg-gray-100 font-bold text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.variantId, item.quantity + 1)
                      }
                      className="w-8 h-8 border rounded-md hover:bg-gray-100 font-bold text-lg leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="font-bold text-lg">
                    ${(item.unitPrice * item.quantity).toLocaleString()}
                  </p>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(item.product.id, item.variantId)}
                    className="text-sm text-red-500 hover:text-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Resumen del pedido ── */}
        <div className="lg:w-80">
          <div className="border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Resumen</h2>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Productos ({totalItems()})</span>
                <span>${totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-gray-400">A calcular</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">${totalPrice().toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-md hover:bg-green-700 transition font-semibold"
            >
              Ir al Checkout
            </Link>
          </div>
        </div>
      </div> 
    </div>
    );}
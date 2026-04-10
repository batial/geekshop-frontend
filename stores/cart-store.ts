// stores/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductResponse, ProductVariantResponse, CartItem } from "@/types";

// Clave única por item: productId + variantId (o solo productId si no tiene variantes)
// Esto permite que la misma remera en M/Negro y L/Blanco sean items separados en el carrito
function cartKey(productId: string, variantId: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

interface CartState {
  items: CartItem[];

  // Para productos SIN variantes
  addItem: (product: ProductResponse, quantity?: number) => void;

  // Para productos CON variantes (se requiere pasar la variante seleccionada)
  addItemWithVariant: (
    product: ProductResponse,
    variant: ProductVariantResponse,
    quantity?: number
  ) => void;

  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: ProductResponse, quantity = 1) => {
        const items = get().items;
        const key = cartKey(product.id, null);
        const existingItem = items.find(
          (item) => cartKey(item.product.id, item.variantId) === key
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              cartKey(item.product.id, item.variantId) === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                variantId: null,
                size: null,
                color: null,
                quantity,
                unitPrice: product.price,
              },
            ],
          });
        }
      },

      addItemWithVariant: (product: ProductResponse, variant: ProductVariantResponse, quantity = 1) => {
        const items = get().items;
        const key = cartKey(product.id, variant.id);
        const existingItem = items.find(
          (item) => cartKey(item.product.id, item.variantId) === key
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              cartKey(item.product.id, item.variantId) === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                variantId: variant.id,
                size: variant.size,
                color: variant.color,
                quantity,
                unitPrice: variant.finalPrice,
              },
            ],
          });
        }
      },

      removeItem: (productId: string, variantId: string | null) => {
        const key = cartKey(productId, variantId);
        set({
          items: get().items.filter(
            (item) => cartKey(item.product.id, item.variantId) !== key
          ),
        });
      },

      updateQuantity: (productId: string, variantId: string | null, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const key = cartKey(productId, variantId);
        set({
          items: get().items.map((item) =>
            cartKey(item.product.id, item.variantId) === key
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },
    }),

    {
      name: "cart-storage-v2",
    }
  )
);
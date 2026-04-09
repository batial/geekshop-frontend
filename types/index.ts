// AUTH - Autenticación y Usuario

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// PRODUCT - Productos

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;         // solo para productos sin variantes (category.hasVariants = false)
  active: boolean;
  categoryId: string;
  categoryName: string;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];  // array vacío si no tiene variantes
}

export interface ProductImageResponse {
  id: string;
  url: string;
  isMain: boolean;
}

export interface ProductVariantResponse {
  id: string;
  size: string;
  color: string;
  stock: number;
  priceModifier: number;
  finalPrice: number;    // price + priceModifier
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  variants?: ProductVariantRequest[];  // solo para categorías con hasVariants = true
}

export interface ProductVariantRequest {
  size: string;
  color: string;
  stock: number;
  priceModifier: number;
}

// CATEGORY - Categorías

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasVariants: boolean;  // determina si los productos de esta categoría usan variantes
}

export interface CategoryRequest {
  name: string;
  slug: string;
  description: string;
  hasVariants?: boolean; // opcional, default false
}

// ORDER - Órdenes/Pedidos

export interface OrderResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  shippingAddress: string;
  city: string;
  phone: string;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  size: string | null;    // snapshot de variante (null si no tiene)
  color: string | null;   // snapshot de variante (null si no tiene)
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderRequest {
  shippingAddress: string;
  city: string;
  phone: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string;
  variantId: string | null;  // null para productos sin variantes
  quantity: number;
}

// PAYMENT - Pagos

export interface PaymentResponse {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
  mpReference: string | null;
  paidAt: string | null;
}

// USER - Usuarios (Admin)

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

// PAGINATION - Paginación

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;    // página actual (0-indexed)
  size: number;      // elementos por página
}

// CART - Carrito (solo frontend)
// La clave única de un item es productId + variantId (un mismo producto
// puede estar en el carrito en distintas variantes: M/Negro y L/Blanco)

export interface CartItem {
  product: ProductResponse;
  variantId: string | null;   // null para productos sin variantes
  size: string | null;        // para mostrar en el carrito
  color: string | null;       // para mostrar en el carrito
  quantity: number;
  unitPrice: number;          // finalPrice de la variante, o price del producto
}
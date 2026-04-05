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
  stock: number;
  type: "SHIRT" | "PRINT_3D" | "ACCESSORY";
  active: boolean;
  categoryId: string;
  categoryName: string;
  images: ProductImageResponse[];
}

export interface ProductImageResponse {
  id: string;
  url: string;
  isMain: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  type: "SHIRT" | "PRINT_3D" | "ACCESSORY";
  categoryId: string;
}

// CATEGORY - Categorías

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  slug: string;
  description: string;
}

// ORDER - Órdenes/Pedidos

export interface OrderResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  shippingAddress: string;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRequest {
  shippingAddress: string;
  items: Record<string, number>; // { "productId": quantity }
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

export interface CartItem {
  product: ProductResponse;
  quantity: number;
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import type { ProductResponse, ProductVariantResponse } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, addItemWithVariant } = useCartStore();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Selección de variante
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get<ProductResponse>(`/products/${params.id}`);
      setProduct(data);
    } catch (error) {
      console.error("Error al cargar producto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasVariants = product && product.variants && product.variants.length > 0;

  // Talles únicos disponibles
  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))];
  }, [product]);

  // Colores disponibles para el talle seleccionado
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const variants = selectedSize
      ? product.variants.filter((v) => v.size === selectedSize)
      : product.variants;
    return [...new Set(variants.map((v) => v.color))];
  }, [product, selectedSize]);

  // Variante que coincide con la selección actual
  const selectedVariant: ProductVariantResponse | null = useMemo(() => {
    if (!product?.variants || !selectedSize || !selectedColor) return null;
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) || null
    );
  }, [product, selectedSize, selectedColor]);

  // Stock y precio a mostrar (varía según si hay variante seleccionada)
  const displayStock = hasVariants
    ? selectedVariant?.stock ?? null
    : product?.stock ?? 0;

  const displayPrice = selectedVariant
    ? selectedVariant.finalPrice
    : product?.price ?? 0;

  // Al cambiar el talle, resetear color si el color actual no está disponible en el nuevo talle
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const colorsForSize = product!.variants
      .filter((v) => v.size === size)
      .map((v) => v.color);
    if (selectedColor && !colorsForSize.includes(selectedColor)) {
      setSelectedColor(null);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (hasVariants) {
      if (!selectedVariant) return; // No debería ejecutarse por la validación del botón
      addItemWithVariant(product, selectedVariant, quantity);
    } else {
      addItem(product, quantity);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (hasVariants) {
      if (!selectedVariant) return;
      addItemWithVariant(product, selectedVariant, quantity);
    } else {
      addItem(product, quantity);
    }

    router.push("/cart");
  };

  // ¿Se puede agregar al carrito?
  const canAddToCart = hasVariants
    ? selectedVariant !== null && selectedVariant.stock > 0
    : (product?.stock ?? 0) > 0;

  const maxQuantity = hasVariants
    ? selectedVariant?.stock ?? 1
    : product?.stock ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link href="/products" className="text-green-600 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-green-600">Inicio</Link>
        {" / "}
        <Link href="/products" className="hover:text-green-600">Productos</Link>
        {" / "}
        <Link
          href={`/categories/${product.categoryId}`}
          className="hover:text-green-600"
        >
          {product.categoryName}
        </Link>
        {" / "}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Columna izquierda - Imagen */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-12">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 mt-4">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Galería de miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:opacity-75"
                >
                  <img
                    src={image.url}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha - Información */}
        <div>
          {/* Categoría */}
          <p className="text-sm text-gray-500 mb-2">{product.categoryName}</p>

          {/* Nombre */}
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {/* Precio */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-green-600">
              ${displayPrice.toLocaleString()}
            </span>
            {selectedVariant && selectedVariant.priceModifier !== 0 && (
              <span className="ml-2 text-sm text-gray-500">
                (precio base: ${product.price.toLocaleString()})
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {!hasVariants ? (
              // Producto sin variantes: mostrar stock directo
              product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">
                    En stock ({product.stock} disponibles)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 font-medium">Sin stock</span>
                </div>
              )
            ) : selectedVariant ? (
              // Variante seleccionada: mostrar su stock
              selectedVariant.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">
                    En stock ({selectedVariant.stock} disponibles)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 font-medium">Sin stock para esta combinación</span>
                </div>
              )
            ) : (
              // Con variantes pero sin selección todavía
              <p className="text-gray-500 text-sm">Seleccioná talle y color para ver disponibilidad</p>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-2">Descripción</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Selector de variantes (solo si el producto tiene variantes) */}
          {hasVariants && (
            <div className="mb-8 space-y-4">
              {/* Talles */}
              <div>
                <h3 className="font-semibold mb-2">
                  Talle{selectedSize && <span className="font-normal text-gray-600 ml-2">{selectedSize}</span>}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 border rounded-md font-medium transition ${
                        selectedSize === size
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div>
                <h3 className="font-semibold mb-2">
                  Color{selectedColor && <span className="font-normal text-gray-600 ml-2">{selectedColor}</span>}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!selectedSize}
                      className={`px-4 py-2 border rounded-md font-medium transition ${
                        selectedColor === color
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 hover:border-green-400 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-sm text-gray-400 mt-1">Primero seleccioná un talle</p>
                )}
              </div>
            </div>
          )}

          {/* Selector de cantidad y botones */}
          {canAddToCart && (
            <div className="space-y-4">
              {/* Cantidad */}
              <div>
                <label className="block font-semibold mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border rounded-md hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value))))
                    }
                    className="w-20 text-center border rounded-md py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-10 h-10 border rounded-md hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mensaje confirmación */}
              {addedToCart && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  ✓ Producto agregado al carrito
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold"
                >
                  Agregar al Carrito
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition font-semibold"
                >
                  Comprar Ahora
                </button>
              </div>

              <Link
                href="/products"
                className="block text-center text-green-600 hover:underline mt-4"
              >
                ← Seguir comprando
              </Link>
            </div>
          )}

          {/* Si no hay stock / requiere selección */}
          {!canAddToCart && (
            <div className="bg-gray-100 p-6 rounded-md text-center">
              {hasVariants && (!selectedSize || !selectedColor) ? (
                <p className="text-gray-700">Seleccioná talle y color para continuar.</p>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">Este producto no está disponible actualmente.</p>
                  <Link href="/products" className="text-green-600 hover:underline font-semibold">
                    Ver otros productos
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

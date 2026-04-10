"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ProductResponse } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products", {
        params: { page: 0, size: 6 },
      });
      setProducts(data.content);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a GeekShop</h1>
          <p className="text-xl mb-8">
            Remeras, impresiones 3D y accesorios para verdaderos geeks
          </p>
          <Link
            href="/products"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Productos Destacados
          </h2>

          {products.length === 0 ? (
            <p className="text-center text-gray-500">
              No hay productos disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProductCardProps {
  product: ProductResponse;
}

function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];

  const hasVariants = product.variants && product.variants.length > 0;
  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="text-gray-400 mt-2 text-sm">Sin imagen</p>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.categoryName}</p>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              ${product.price.toLocaleString()}
            </span>
            {totalStock > 0 ? (
              <span className="text-sm text-green-600">
                {hasVariants ? "Con talles" : `Stock: ${product.stock}`}
              </span>
            ) : (
              <span className="text-sm text-red-600">Sin stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

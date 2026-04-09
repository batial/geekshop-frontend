"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ProductResponse, CategoryResponse, Page } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 0);

  // Cargar categorías una sola vez al montar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get<CategoryResponse[]>("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const updateURL = useCallback(
    (params: { search?: string; category?: string; page?: number }) => {
      const newParams = new URLSearchParams();
      if (params.search) newParams.set("search", params.search);
      if (params.category) newParams.set("category", params.category);
      if (params.page !== undefined && params.page > 0)
        newParams.set("page", params.page.toString());
      const queryString = newParams.toString();
      router.push(queryString ? `/products?${queryString}` : "/products");
    },
    [router]
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: Page<ProductResponse>;

      if (selectedSlug) {
        // Filtrar por categoría
        const response = await api.get<Page<ProductResponse>>(
          `/products/category/slug/${selectedSlug}`,
          { params: { page: currentPage, size: 12, ...(searchTerm && { search: searchTerm }) } }
        );
        data = response.data;
      } else {
        // Sin filtro de categoría
        const response = await api.get<Page<ProductResponse>>("/products", {
          params: { page: currentPage, size: 12, ...(searchTerm && { search: searchTerm }) },
        });
        data = response.data;
      }

      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedSlug, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setCurrentPage(0);
    updateURL({ search: inputValue, category: selectedSlug, page: 0 });
  };

  const handleCategoryFilter = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentPage(0);
    updateURL({ search: searchTerm, category: slug, page: 0 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL({ search: searchTerm, category: selectedSlug, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCategory = categories.find((c) => c.slug === selectedSlug);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Catálogo de Productos</h1>
          <p className="text-gray-600">Explorá nuestra colección completa</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <aside className="lg:w-64 space-y-6">
            {/* Búsqueda */}
            <div>
              <h3 className="font-semibold mb-3">Buscar</h3>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="w-full mt-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                  Buscar
                </button>
              </form>

              {/* Filtros activos */}
              {(searchTerm || selectedSlug) && (
                <div className="mt-3 space-y-2">
                  {searchTerm && (
                    <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md text-sm">
                      <span>
                        Buscando: <strong>{searchTerm}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setInputValue("");
                          setSearchTerm("");
                          updateURL({ category: selectedSlug, page: 0 });
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md text-sm">
                      <span>
                        Categoría: <strong>{selectedCategory.name}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSlug("");
                          updateURL({ search: searchTerm, page: 0 });
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filtro por categoría */}
            <div>
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryFilter("")}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedSlug === ""
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Todas
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      selectedSlug === category.slug
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron productos.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-gray-600">
                  Mostrando {products.length} productos
                  {selectedCategory && (
                    <span className="ml-1">en <strong>{selectedCategory.name}</strong></span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2">
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE: ProductCard
interface ProductCardProps {
  product: ProductResponse;
}

function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
  const hasVariants = product.variants && product.variants.length > 0;

  // Stock total del producto (suma de todas las variantes, o stock directo)
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

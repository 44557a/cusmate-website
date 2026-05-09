"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  basePrice: number;
  suggestedPrice: number;
  status: "active" | "draft" | "archived";
  variants: number;
  createdAt: string;
  updatedAt: string;
}

const mockProducts: Product[] = [
  {
    id: "PRD-001",
    image: "https://printify.com/pfh/assets/products-display/t-shirt.webp",
    name: "Unisex Jersey Short Sleeve Tee",
    category: "Men's Clothing",
    basePrice: 8.69,
    suggestedPrice: 19.99,
    status: "active",
    variants: 12,
    createdAt: "2024-01-15",
    updatedAt: "2024-05-01",
  },
  {
    id: "PRD-002",
    image: "https://printify.com/pfh/assets/products-display/sweatshirt.webp",
    name: "Unisex Heavy Blend Crewneck Sweatshirt",
    category: "Men's Clothing",
    basePrice: 12.98,
    suggestedPrice: 29.99,
    status: "active",
    variants: 8,
    createdAt: "2024-01-20",
    updatedAt: "2024-04-28",
  },
  {
    id: "PRD-003",
    image: "https://printify.com/pfh/assets/products-display/hoodie.webp",
    name: "Unisex Heavy Blend Hooded Sweatshirt",
    category: "Men's Clothing",
    basePrice: 15.50,
    suggestedPrice: 34.99,
    status: "active",
    variants: 10,
    createdAt: "2024-02-01",
    updatedAt: "2024-05-03",
  },
  {
    id: "PRD-004",
    image: "https://printify.com/pfh/assets/products-display/mug.webp",
    name: "11oz White Ceramic Mug",
    category: "Home & Living",
    basePrice: 5.99,
    suggestedPrice: 14.99,
    status: "active",
    variants: 6,
    createdAt: "2024-02-10",
    updatedAt: "2024-04-15",
  },
  {
    id: "PRD-005",
    image: "https://printify.com/pfh/assets/products-display/posters.webp",
    name: "Matte Canvas Stretched 1.25\"",
    category: "Home & Living",
    basePrice: 8.10,
    suggestedPrice: 24.99,
    status: "draft",
    variants: 4,
    createdAt: "2024-03-01",
    updatedAt: "2024-05-05",
  },
  {
    id: "PRD-006",
    image: "https://printify.com/pfh/assets/products-display/phone-cases.webp",
    name: "Snap Case - iPhone 15 Pro",
    category: "Accessories",
    basePrice: 7.50,
    suggestedPrice: 19.99,
    status: "active",
    variants: 15,
    createdAt: "2024-03-05",
    updatedAt: "2024-05-02",
  },
  {
    id: "PRD-007",
    image: "https://printify.com/pfh/assets/products-display/bag.webp",
    name: "Large Tote Bag",
    category: "Accessories",
    basePrice: 9.99,
    suggestedPrice: 22.99,
    status: "active",
    variants: 5,
    createdAt: "2024-03-10",
    updatedAt: "2024-04-20",
  },
  {
    id: "PRD-008",
    image: "https://printify.com/pfh/assets/products-display/kids-clothing.webp",
    name: "Kids Heavy Cotton Tee",
    category: "Kids Clothing",
    basePrice: 6.99,
    suggestedPrice: 16.99,
    status: "active",
    variants: 8,
    createdAt: "2024-03-15",
    updatedAt: "2024-05-04",
  },
  {
    id: "PRD-009",
    image: "https://printify.com/pfh/assets/products-display/stickers.webp",
    name: "Kiss-Cut Stickers",
    category: "Home & Living",
    basePrice: 2.50,
    suggestedPrice: 5.99,
    status: "archived",
    variants: 20,
    createdAt: "2024-01-05",
    updatedAt: "2024-03-20",
  },
  {
    id: "PRD-010",
    image: "https://printify.com/pfh/assets/products-display/candles.webp",
    name: "Scented Soy Candle 9oz",
    category: "Home & Living",
    basePrice: 11.99,
    suggestedPrice: 26.99,
    status: "draft",
    variants: 3,
    createdAt: "2024-04-01",
    updatedAt: "2024-05-06",
  },
];

const categories = ["All", "Men's Clothing", "Women's Clothing", "Kids Clothing", "Home & Living", "Accessories"];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const itemsPerPage = 5;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedProducts(newSet);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Active
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const SortIcon = ({ field }: { field: keyof Product }) => {
    if (sortField !== field)
      return <ChevronDown className="h-4 w-4 text-gray-300" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-green-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-green-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Matrix
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog &amp; inventory
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600">
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        selectedProducts.size === paginatedProducts.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("id")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      Product ID
                      <SortIcon field="id" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      Category
                      <SortIcon field="category" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("basePrice")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      Base Price
                      <SortIcon field="basePrice" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Suggested Price
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Variants
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("updatedAt")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      Last Updated
                      <SortIcon field="updatedAt" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-mono text-gray-600">
                        {product.id}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.basePrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-green-600">
                        ${product.suggestedPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {product.variants} variants
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {product.updatedAt}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No products found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              {" "}-{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, sortedProducts.length)}
              </span>
              {" "}of{" "}
              <span className="font-medium">{sortedProducts.length}</span>{" "}
              products
              {selectedProducts.size > 0 && (
                <span className="ml-2">
                  ({selectedProducts.size} selected)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      page === currentPage
                        ? "bg-green-500 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    products.filter((p) => p.status === "active").length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Draft Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    products.filter((p) => p.status === "draft").length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <MoreHorizontal className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

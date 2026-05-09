"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Cusmate</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/connect" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Connect Store
          </Link>
          <Link href="/platforms/amazon" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Amazon
          </Link>
          <Link href="/platforms/etsy" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Etsy
          </Link>
          <Link href="/platforms/shopify" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Shopify
          </Link>
          <Link href="/platforms/woocommerce" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            WooCommerce
          </Link>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </a>
          <a
            href="#"
            className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            Sign up
          </a>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600">Home</Link>
            <Link href="/connect" className="text-sm font-medium text-gray-600">Connect Store</Link>
            <Link href="/platforms/amazon" className="text-sm font-medium text-gray-600">Amazon</Link>
            <Link href="/platforms/etsy" className="text-sm font-medium text-gray-600">Etsy</Link>
            <Link href="/platforms/shopify" className="text-sm font-medium text-gray-600">Shopify</Link>
            <Link href="/platforms/woocommerce" className="text-sm font-medium text-gray-600">WooCommerce</Link>
            <hr className="border-gray-100" />
            <a href="#" className="text-sm font-medium text-gray-600">Log in</a>
            <a
              href="#"
              className="rounded-full bg-green-500 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign up
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

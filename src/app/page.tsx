"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  StarHalf,
  ArrowRight,
  Play,
  Clock,
  Zap,
  Shield,
  Globe,
  ShoppingBag,
  Palette,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const products = [
  { name: "T-shirts", image: "https://printify.com/pfh/assets/products-display/t-shirt.webp" },
  { name: "Sweatshirt", image: "https://printify.com/pfh/assets/products-display/sweatshirt.webp" },
  { name: "Mugs", image: "https://printify.com/pfh/assets/products-display/mug.webp" },
  { name: "Hoodie", image: "https://printify.com/pfh/assets/products-display/hoodie.webp" },
  { name: "Kids clothing", image: "https://printify.com/pfh/assets/products-display/kids-clothing.webp" },
  { name: "Stickers", image: "https://printify.com/pfh/assets/products-display/stickers.webp" },
  { name: "Phone cases", image: "https://printify.com/pfh/assets/products-display/phone-cases.webp" },
  { name: "Posters", image: "https://printify.com/pfh/assets/products-display/posters.webp" },
  { name: "Candles", image: "https://printify.com/pfh/assets/products-display/candles.webp" },
  { name: "Bags", image: "https://printify.com/pfh/assets/products-display/bag.webp" },
];

const platforms = [
  {
    name: "Amazon",
    description: "Sell on the world's largest marketplace",
    color: "from-orange-400 to-orange-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M15.93 17.09c-.18.23-.47.31-.72.22-1.02-.39-2.17-.6-3.38-.6-3.21 0-5.96 1.94-7.12 4.7-.12.28-.46.42-.75.29-.28-.13-.41-.46-.29-.74C4.29 17.38 8.28 14.5 12.83 14.5c1.44 0 2.81.26 4.07.73.29.11.44.44.33.73-.05.14-.15.25-.3.13z"/>
        <path d="M13.5 2C7.7 2 3 6.7 3 12.5c0 2.3.8 4.4 2.1 6.1.2-.7.5-1.4.9-2-1-1.3-1.5-2.9-1.5-4.6 0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5c0 1.7-.5 3.3-1.5 4.6.4.6.7 1.3.9 2 1.3-1.7 2.1-3.8 2.1-6.1C23 6.7 18.3 2 12.5 2z"/>
        <circle cx="12.5" cy="12.5" r="2.5"/>
      </svg>
    ),
  },
  {
    name: "Etsy",
    description: "Reach handmade and vintage buyers",
    color: "from-orange-500 to-red-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    ),
  },
  {
    name: "Shopify",
    description: "Build your own online store",
    color: "from-green-500 to-emerald-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.058-.121-.074l-.914 21.104zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.905-1.504 1.129 0 1.232 3.24 1.715 3.24 4.646 0 2.315-1.432 3.799-3.613 3.799-1.567 0-2.954-.849-2.954-.849l.522-1.752s1.039.893 1.939.893c.578 0 .814-.456.814-.79 0-1.379-2.66-1.441-2.66-3.73 0-2.221 1.509-4.38 4.654-4.38.849 0 1.274.213 1.274.213l-.138 1.445z"/>
      </svg>
    ),
  },
  {
    name: "WooCommerce",
    description: "Turn WordPress into a store",
    color: "from-purple-500 to-indigo-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    ),
  },
];

const faqs = [
  {
    question: "What is print on demand?",
    answer:
      "Print on demand is a fulfillment model where products are printed only after an order is placed. This means no upfront inventory costs and no risk of unsold stock.",
  },
  {
    question: "How much does it cost to use Cusmate?",
    answer:
      "Cusmate is completely free to use. You only pay for the products you sell. We also offer a Premium plan with up to 20% discounts on all products.",
  },
  {
    question: "Which platforms can I sell on?",
    answer:
      "You can sell on Amazon, Etsy, Shopify, WooCommerce, and more. We offer direct integrations with all major e-commerce platforms.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping times vary by product and destination. Most orders are produced within 2-5 business days and delivered within 5-10 business days globally.",
  },
  {
    question: "Do I need design experience?",
    answer:
      "Not at all! Our mockup generator makes it easy to create professional designs. You can also use our AI design tools or hire designers from our marketplace.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={onClick}
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Create and sell{" "}
                <span className="text-green-500">custom products</span>
              </h1>
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">100% Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">1300+ products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Global delivery</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-semibold">4.8</span>
                </div>
                <span className="text-sm text-gray-500">Trusted by 10M+ sellers</span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-6 aspect-square flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-purple-500" />
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 p-6 aspect-square flex items-center justify-center">
                    <Palette className="h-16 w-16 text-blue-500" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-6 aspect-square flex items-center justify-center">
                    <Truck className="h-16 w-16 text-green-500" />
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 p-6 aspect-square flex items-center justify-center">
                    <Globe className="h-16 w-16 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your next bestseller awaits
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="rounded-full border border-gray-200 p-2 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="rounded-full border border-gray-200 p-2 hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <a
                key={index}
                href="#"
                className="flex-shrink-0 group"
              >
                <div className="mb-3 h-48 w-48 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-900">
                  {product.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start selling in 3 simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose a product",
                description:
                  "Browse our catalog of 1300+ products and pick the perfect items for your brand.",
                icon: <ShoppingBag className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Add your design",
                description:
                  "Use our mockup generator to add your artwork and create stunning product visuals.",
                icon: <Palette className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Start selling",
                description:
                  "Connect your store and start selling. We handle printing, packing, and shipping.",
                icon: <Zap className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  {item.icon}
                </div>
                <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  Step {item.step}
                </span>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Sell on multiple platforms
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect your store and reach millions of customers
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((platform, index) => (
              <Link
                key={index}
                href={`/platforms/${platform.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${platform.color} text-white`}
                >
                  {platform.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600">{platform.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-500">
                  Learn more
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-600 transition-colors"
            >
              Connect your store
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                Learn how to connect{" "}
                <span className="text-green-500">your store</span>{" "}
                with Cusmate
              </h2>
              <p className="mb-6 text-gray-600">
                Watch our step-by-step tutorial and get your store connected in minutes.
              </p>
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Connect now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Setup time:</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Under 5 minutes
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                    <p className="text-white/80 text-sm">Watch the tutorial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you need to
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "Unlimited product designs",
                  "All integrations",
                  "Mockup generator",
                  "Global shipping",
                  "24/7 support",
                ],
                cta: "Get started",
                popular: false,
              },
              {
                name: "Premium",
                price: "$29",
                period: "/month",
                description: "Best for growing businesses",
                features: [
                  "Everything in Free",
                  "Up to 20% product discounts",
                  "Custom order imports",
                  "Priority support",
                  "Advanced analytics",
                ],
                cta: "Start free trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For high-volume sellers",
                features: [
                  "Everything in Premium",
                  "Dedicated account manager",
                  "API access",
                  "Custom integrations",
                  "Volume discounts",
                ],
                cta: "Contact sales",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-green-500 bg-green-50/50"
                    : "border-gray-100 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-green-500 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-gray-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`mt-8 block w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-600 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Start building your eCommerce business today
              </h2>
              <p className="mb-8 text-lg text-green-100">
                Join 10M+ sellers who trust Cusmate to power their print-on-demand business.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-green-600 hover:bg-gray-100 transition-colors"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10"></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                  <span className="text-lg font-bold text-white">C</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Cusmate</span>
              </div>
              <p className="text-sm text-gray-500">
                Build your eCommerce business in minutes with print-on-demand.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Catalog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Mockup Generator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Integrations</h4>
              <ul className="space-y-2">
                <li><Link href="/platforms/amazon" className="text-sm text-gray-500 hover:text-gray-900">Amazon</Link></li>
                <li><Link href="/platforms/etsy" className="text-sm text-gray-500 hover:text-gray-900">Etsy</Link></li>
                <li><Link href="/platforms/shopify" className="text-sm text-gray-500 hover:text-gray-900">Shopify</Link></li>
                <li><Link href="/platforms/woocommerce" className="text-sm text-gray-500 hover:text-gray-900">WooCommerce</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 md:flex-row">
            <p className="text-sm text-gray-400">
              &copy; 2024 Cusmate. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

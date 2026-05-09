"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Store,
  Wrench,
  CreditCard,
  Users,
  ChevronDown,
  ShoppingCart,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const faqs = [
  {
    question: "What is Shopify print on demand?",
    answer:
      "Shopify print on demand lets you sell custom products through your own branded online store, with no inventory needed.",
  },
  {
    question: "How does Cusmate integrate with Shopify?",
    answer:
      "Install the Cusmate app from the Shopify App Store with one click. Your products sync automatically, and orders are fulfilled seamlessly.",
  },
  {
    question: "Do I need a Shopify store?",
    answer:
      "Yes, you'll need a Shopify store. Start with a 3-day free trial at shopify.com.",
  },
  {
    question: "What products can I sell on Shopify?",
    answer:
      "All 1300+ products in the Cusmate catalog are available for your Shopify store.",
  },
  {
    question: "What are Shopify's fees?",
    answer:
      "Shopify plans start at $39/month. Transaction fees vary by plan. Cusmate is free to use.",
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

export default function ShopifyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-green-700">Top Integration</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Cusmate{" "}
                <span className="text-green-500">x</span>{" "}
                Shopify Integration
              </h1>
              <p className="mb-8 text-lg text-gray-600 leading-relaxed">
                Build your own branded online store and sell custom products 
                with Cusmate&apos;s powerful Shopify integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  Start selling
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#how-to-connect"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                >
                  How to connect
                </a>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                <Check className="mr-1 inline h-4 w-4 text-green-500" />
                100% Free. Easy to use.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Platform</p>
                    <p className="text-lg font-bold text-gray-900">Shopify</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Store className="mb-2 h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-semibold text-gray-900">E-commerce</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Wrench className="mb-2 h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500">Setup</p>
                    <p className="text-sm font-semibold text-gray-900">One-click</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <CreditCard className="mb-2 h-5 w-5 text-blue-500" />
                    <p className="text-xs text-gray-500">Subscription</p>
                    <p className="text-sm font-semibold text-gray-900">From $39/mo</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Users className="mb-2 h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-500">Best for</p>
                    <p className="text-sm font-semibold text-gray-900">All businesses</p>
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
              Sell on Shopify with Cusmate
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Install the app",
                description:
                  "Add Cusmate from the Shopify App Store with one click.",
                icon: <Settings className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Create products",
                description:
                  "Design your products using our mockup generator.",
                icon: <ShoppingCart className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Grow your brand",
                description:
                  "Sell through your own branded store and scale your business.",
                icon: <TrendingUp className="h-8 w-8" />,
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

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why choose Shopify?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Your own brand",
                description: "Build a fully branded store that represents your unique identity.",
              },
              {
                title: "Powerful analytics",
                description: "Track sales, customer behavior, and growth with built-in analytics.",
              },
              {
                title: "App ecosystem",
                description: "Access thousands of apps to extend your store's functionality.",
              },
              {
                title: "Secure checkout",
                description: "Offer customers a secure and seamless checkout experience.",
              },
              {
                title: "Mobile ready",
                description: "Your store looks great on every device out of the box.",
              },
              {
                title: "24/7 support",
                description: "Get help whenever you need it with round-the-clock support.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
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

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Start selling on Shopify with Cusmate
              </h2>
              <p className="mb-8 text-lg text-green-100">
                Build your brand and grow your business with our Shopify integration.
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
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Cusmate</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2024 Cusmate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
  Plug,
  Code,
  Globe,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const faqs = [
  {
    question: "What is WooCommerce print on demand?",
    answer:
      "WooCommerce print on demand lets you sell custom products through your WordPress website with no inventory needed.",
  },
  {
    question: "How does Cusmate integrate with WooCommerce?",
    answer:
      "Install the Cusmate plugin from WordPress.org. Connect your store, and your products will sync automatically.",
  },
  {
    question: "Do I need a WordPress site?",
    answer:
      "Yes, you'll need a WordPress website with WooCommerce installed. Both are free and open-source.",
  },
  {
    question: "What products can I sell with WooCommerce?",
    answer:
      "All 1300+ products in the Cusmate catalog are available for your WooCommerce store.",
  },
  {
    question: "What are the costs?",
    answer:
      "WordPress and WooCommerce are free. You'll need web hosting. Cusmate is free to use.",
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

export default function WooCommercePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-sm font-medium text-purple-700">Flexible Integration</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Cusmate{" "}
                <span className="text-purple-500">x</span>{" "}
                WooCommerce
              </h1>
              <p className="mb-8 text-lg text-gray-600 leading-relaxed">
                Turn your WordPress website into a powerful online store and sell 
                custom products with Cusmate&apos;s WooCommerce integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-purple-600 transition-colors"
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
                <Check className="mr-1 inline h-4 w-4 text-purple-500" />
                100% Free. Easy to use.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                    <Plug className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Platform</p>
                    <p className="text-lg font-bold text-gray-900">WooCommerce</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Store className="mb-2 h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-semibold text-gray-900">Plugin</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Wrench className="mb-2 h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500">Setup</p>
                    <p className="text-sm font-semibold text-gray-900">Moderate</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <CreditCard className="mb-2 h-5 w-5 text-blue-500" />
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="text-sm font-semibold text-gray-900">Free</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Users className="mb-2 h-5 w-5 text-orange-500" />
                    <p className="text-xs text-gray-500">Best for</p>
                    <p className="text-sm font-semibold text-gray-900">WP Users</p>
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
              Sell with WooCommerce & Cusmate
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Install plugin",
                description:
                  "Add the Cusmate plugin to your WordPress site from the plugin directory.",
                icon: <Plug className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Connect & configure",
                description:
                  "Link your Cusmate account and configure your store settings.",
                icon: <Code className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Launch your store",
                description:
                  "Publish your products and start selling to the world.",
                icon: <Globe className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
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
              Why choose WooCommerce?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Full control",
                description: "Own your data and have complete control over your store.",
              },
              {
                title: "Open source",
                description: "Free, open-source platform with no monthly fees.",
              },
              {
                title: "Highly customizable",
                description: "Thousands of themes and plugins to extend functionality.",
              },
              {
                title: "WordPress powered",
                description: "Leverage the world's most popular CMS for your store.",
              },
              {
                title: "SEO friendly",
                description: "Built-in SEO tools to help customers find your store.",
              },
              {
                title: "Scalable",
                description: "Grows with your business from startup to enterprise.",
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Start selling with WooCommerce & Cusmate
              </h2>
              <p className="mb-8 text-lg text-purple-100">
                Turn your WordPress site into a thriving online store today.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-purple-600 hover:bg-gray-100 transition-colors"
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

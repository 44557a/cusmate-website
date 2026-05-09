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
  Heart,
  Sparkles,
  Gift,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const faqs = [
  {
    question: "What is Etsy print on demand?",
    answer:
      "Etsy print on demand allows you to sell custom-designed products on Etsy without holding inventory. Perfect for handmade and unique item sellers.",
  },
  {
    question: "How does Cusmate integrate with Etsy?",
    answer:
      "Cusmate connects directly to your Etsy shop via API. Your products sync automatically, and orders are fulfilled seamlessly.",
  },
  {
    question: "Do I need an Etsy shop?",
    answer:
      "Yes, you need an active Etsy shop. Setting up is free and takes just a few minutes at etsy.com/sell.",
  },
  {
    question: "What products sell best on Etsy?",
    answer:
      "Personalized items, custom apparel, home decor, and unique gifts perform exceptionally well on Etsy.",
  },
  {
    question: "What are Etsy's fees?",
    answer:
      "Etsy charges a $0.20 listing fee per item and a 6.5% transaction fee. Cusmate is free to use.",
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

export default function EtsyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                <span className="text-sm font-medium text-orange-700">Popular Integration</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Cusmate{" "}
                <span className="text-orange-500">x</span>{" "}
                Etsy Integration
              </h1>
              <p className="mb-8 text-lg text-gray-600 leading-relaxed">
                Reach millions of buyers looking for handmade, vintage, and unique 
                custom products with Cusmate&apos;s Etsy integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
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
                <Check className="mr-1 inline h-4 w-4 text-orange-500" />
                100% Free. Easy to use.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Platform</p>
                    <p className="text-lg font-bold text-gray-900">Etsy</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Store className="mb-2 h-5 w-5 text-orange-500" />
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-semibold text-gray-900">Marketplace</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Wrench className="mb-2 h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500">Setup</p>
                    <p className="text-sm font-semibold text-gray-900">Easy</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <CreditCard className="mb-2 h-5 w-5 text-blue-500" />
                    <p className="text-xs text-gray-500">Listing fee</p>
                    <p className="text-sm font-semibold text-gray-900">$0.20/item</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Users className="mb-2 h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-500">Best for</p>
                    <p className="text-sm font-semibold text-gray-900">Creatives</p>
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
              Sell on Etsy with Cusmate
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your Etsy shop",
                description:
                  "Set up your Etsy shop and connect it to Cusmate in minutes.",
                icon: <Store className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Design unique products",
                description:
                  "Create personalized items that stand out in the Etsy marketplace.",
                icon: <Sparkles className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Publish and sell",
                description:
                  "List your products on Etsy and start reaching millions of buyers.",
                icon: <Gift className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
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
              Why sell on Etsy?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "96M+ Active buyers",
                description: "Reach a massive audience of shoppers looking for unique items.",
              },
              {
                title: "Personalized products",
                description: "Etsy buyers love custom and personalized items.",
              },
              {
                title: "Low startup costs",
                description: "Only $0.20 per listing to get started.",
              },
              {
                title: "Strong community",
                description: "Join a supportive community of creative sellers.",
              },
              {
                title: "Global reach",
                description: "Sell to buyers in over 200 countries worldwide.",
              },
              {
                title: "Easy setup",
                description: "Connect your shop and start selling in under 10 minutes.",
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Start selling on Etsy with Cusmate
              </h2>
              <p className="mb-8 text-lg text-orange-100">
                Join thousands of creative sellers on Etsy today.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-orange-600 hover:bg-gray-100 transition-colors"
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

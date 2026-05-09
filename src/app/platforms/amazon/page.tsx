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
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const faqs = [
  {
    question: "What is Amazon print on demand?",
    answer:
      "Amazon print on demand is a service that allows sellers to list custom-designed products on Amazon without holding inventory. When a customer places an order, the product is printed and shipped directly to them.",
  },
  {
    question: "How does Cusmate integrate with Amazon?",
    answer:
      "Cusmate integrates directly with Amazon through our API connection. Once connected, your Cusmate products sync automatically with your Amazon seller account, and orders flow seamlessly between the platforms.",
  },
  {
    question: "Do I need an Amazon seller account?",
    answer:
      "Yes, you need an Amazon seller account to sell on Amazon. You can sign up at sellercentral.amazon.com. A Professional selling plan is required to use the Cusmate integration.",
  },
  {
    question: "What products can I sell on Amazon with Cusmate?",
    answer:
      "You can sell a wide range of print-on-demand products including t-shirts, sweatshirts, hoodies, phone cases, posters, canvases, mugs, and more. All products in the Cusmate catalog are available for Amazon sales.",
  },
  {
    question: "How much does it cost to sell on Amazon with Cusmate?",
    answer:
      "Cusmate is free to use. Amazon charges a Professional selling plan fee of $39.99/month plus referral fees per sale. With Cusmate Premium, you get up to 20% discount on all products, increasing your profit margins.",
  },
];

const priceComparisons = [
  {
    name: "Gildan 18000 Sweatshirt",
    competitor: "$13.50 – $15",
    printify: "$12.98",
    note: "With Cusmate Premium subscription",
  },
  {
    name: "Matte Canvas, Stretched, 1.25\"",
    competitor: "$10.50 – $12.20",
    printify: "$8.10",
    note: "With Cusmate Premium subscription",
  },
  {
    name: "Bella+Canvas 3001 Tee",
    competitor: "$9 – $10.30",
    printify: "$8.69",
    note: "With Cusmate Premium subscription",
  },
  {
    name: "Framed Vertical Poster",
    competitor: "$28.80 – $31",
    printify: "$26.68",
    note: "With Cusmate Premium subscription",
  },
  {
    name: "Gildan 64000 Tee",
    competitor: "$8.50 – $9.30",
    printify: "$7.78",
    note: "With Cusmate Premium subscription",
  },
  {
    name: "Plastic Yard Sign",
    competitor: "$15 – $18",
    printify: "$12.50",
    note: "With Cusmate Premium subscription",
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

export default function AmazonPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-green-700">New Integration</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Cusmate{" "}
                <span className="text-green-500">x</span>{" "}
                Amazon Integration
              </h1>
              <p className="mb-8 text-lg text-gray-600 leading-relaxed">
                Sell your custom products with the biggest online retailer in the
                world thanks to Cusmate&apos;s direct integration with Amazon.
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                      <path d="M15.93 17.09c-.18.23-.47.31-.72.22-1.02-.39-2.17-.6-3.38-.6-3.21 0-5.96 1.94-7.12 4.7-.12.28-.46.42-.75.29-.28-.13-.41-.46-.29-.74C4.29 17.38 8.28 14.5 12.83 14.5c1.44 0 2.81.26 4.07.73.29.11.44.44.33.73-.05.14-.15.25-.3.13zM18.17 15.5c-.13.17-.34.22-.52.16-.76-.28-1.62-.43-2.52-.43-2.41 0-4.47 1.46-5.34 3.53-.09.21-.35.32-.57.22-.21-.1-.31-.35-.22-.56.97-2.37 3.78-4.16 7.13-4.16 1.08 0 2.11.2 3.06.55.22.08.33.33.25.55-.04.11-.11.19-.27.14z"/>
                      <path d="M13.5 2C7.7 2 3 6.7 3 12.5c0 2.3.8 4.4 2.1 6.1.2-.7.5-1.4.9-2-1-1.3-1.5-2.9-1.5-4.6 0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5c0 1.7-.5 3.3-1.5 4.6.4.6.7 1.3.9 2 1.3-1.7 2.1-3.8 2.1-6.1C23 6.7 18.3 2 12.5 2z"/>
                      <circle cx="12.5" cy="12.5" r="2.5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Platform</p>
                    <p className="text-lg font-bold text-gray-900">Amazon</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Store className="mb-2 h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-semibold text-gray-900">Marketplace</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Wrench className="mb-2 h-5 w-5 text-orange-500" />
                    <p className="text-xs text-gray-500">Setup</p>
                    <p className="text-sm font-semibold text-gray-900">Requires effort</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <CreditCard className="mb-2 h-5 w-5 text-blue-500" />
                    <p className="text-xs text-gray-500">Subscription fee</p>
                    <p className="text-sm font-semibold text-gray-900">Yes</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <Users className="mb-2 h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-500">Best for</p>
                    <p className="text-sm font-semibold text-gray-900">Small businesses</p>
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
              Sell on Amazon with Cusmate
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create a Cusmate account",
                description:
                  "Sign up for free and access our catalog of beautiful products.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Create your products",
                description:
                  "Add your designs to hundreds of items ready to ship around the world.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Connect and profit",
                description:
                  "Connect to your online store and sell. Our network will get your orders delivered.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
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
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Better prices = more profit for you
            </h2>
          </div>
          <p className="mb-12 text-center text-gray-600">
            Curious about how our prices compare?<br />
            Check out our prices for the best-selling Amazon POD products:
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {priceComparisons.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-bold text-gray-900">{item.name}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Competitor price</p>
                    <p className="text-lg font-semibold text-gray-400 line-through">
                      {item.competitor}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cusmate&apos;s price</p>
                    <p className="text-2xl font-bold text-green-500">{item.printify}</p>
                    <p className="text-xs text-gray-400">*{item.note}</p>
                  </div>
                </div>
                <a
                  href="#"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-500 hover:text-green-600"
                >
                  See the product
                  <ArrowRight className="h-3 w-3" />
                </a>
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-600 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Start selling on Amazon with Cusmate
              </h2>
              <p className="mb-8 text-lg text-green-100">
                Join thousands of sellers who are growing their business with our Amazon integration.
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

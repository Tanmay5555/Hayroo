import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, RotateCcw, CreditCard, ShieldCheck, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { generateFaqSchema } from '../utils/schemaGenerator';

const FAQ_DATA = [
  // Shipping FAQs
  {
    id: 'ship-1',
    category: 'Shipping',
    question: 'How long does standard and express delivery take?',
    answer:
      'Standard delivery typically arrives within 3 to 5 business days for major metro locations across India. Express orders placed before 2:00 PM are dispatched on the same business day and usually arrive within 24 to 48 hours. Remote locations may take up to 7 business days.',
  },
  {
    id: 'ship-2',
    category: 'Shipping',
    question: 'What are the shipping fees, and how do I qualify for free delivery?',
    answer:
      'All orders totaling ₹1,500 or more automatically qualify for free standard express shipping nationwide. For orders below ₹1,500, a flat shipping charge of ₹99 is calculated at checkout.',
  },
  {
    id: 'ship-3',
    category: 'Shipping',
    question: 'How do I track my dispatched order?',
    answer:
      'As soon as your package is handed over to our verified courier partner, you receive an automated SMS and email containing your live tracking AWB number. You can also track your shipment status anytime in your Hayroo Account dashboard under "My Orders".',
  },

  // Returns & Exchanges FAQs
  {
    id: 'ret-1',
    category: 'Returns',
    question: 'What is your return and replacement policy?',
    answer:
      'Hayroo offers a straightforward 30-day return and replacement policy. If an item arrives damaged, defective, or incorrect, you can request an instant pickup and exchange directly from your account page or by contacting our customer care team.',
  },
  {
    id: 'ret-2',
    category: 'Returns',
    question: 'What condition must items be in to qualify for return?',
    answer:
      'Items must be returned in their original packaging with all included accessories, user manuals, warranty cards, and manufacturer seals intact. Physical damage caused by improper usage is not eligible for return.',
  },
  {
    id: 'ret-3',
    category: 'Returns',
    question: 'How and when will my refund be processed?',
    answer:
      'Once our quality inspection team verifies the returned package (typically within 24 to 48 hours of receipt), refunds are issued immediately. Online payments (credit cards, UPI, net banking) reflect in your source account within 3 to 5 business days. Cash on Delivery orders are refunded via direct NEFT bank transfer or UPI.',
  },

  // Payment FAQs
  {
    id: 'pay-1',
    category: 'Payments',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept all major debit and credit cards (Visa, Mastercard, RuPay, American Express), UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ Indian banks, and Cash on Delivery (COD) on eligible pin codes.',
  },
  {
    id: 'pay-2',
    category: 'Payments',
    question: 'Is it safe to pay online on Hayroo?',
    answer:
      'Yes, completely safe. All online transactions are processed through Razorpay using bank-grade 256-bit SSL encryption. We never store or view your full card numbers, CVV codes, or banking passwords.',
  },
  {
    id: 'pay-3',
    category: 'Payments',
    question: 'Is Cash on Delivery available for high-value electronics?',
    answer:
      'Cash on Delivery is available on orders up to ₹25,000 for verified residential pincodes. For orders exceeding ₹25,000, secure online payment is required to ensure courier safety and instant transit insurance coverage.',
  },

  // Warranty & Product FAQs
  {
    id: 'prod-1',
    category: 'Warranty',
    question: 'Are all products genuine and covered by warranty?',
    answer:
      'Yes, 100%. Hayroo sources inventory directly from official brand manufacturers and authorized national distributors. Every product comes with its authentic manufacturer warranty card valid at official service centers across India.',
  },
  {
    id: 'prod-2',
    category: 'Warranty',
    question: 'How do I claim manufacturer warranty for an item?',
    answer:
      'Your Hayroo tax invoice serves as your proof of purchase. You can present this invoice at any authorized brand service center. If you need assistance locating your nearest service center, our support desk is happy to help.',
  },
];

const CATEGORIES = ['All', 'Shipping', 'Returns', 'Payments', 'Warranty'];

export default function FaqPage() {
  useSeo({
    title: 'Frequently Asked Questions & Support',
    description: 'Find answers about Hayroo shipping, payments, 30-day returns, and 1-year product warranties.',
    canonicalPath: '/faq',
    jsonLd: generateFaqSchema(FAQ_DATA),
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(['ship-1', 'ret-1']); // default open questions

  const toggleAccordion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          Help and Knowledge Base
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--color-text)]">
          Frequently Asked Questions
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
          Clear answers about shipping timelines, returns and replacements, payment security, and official brand warranties.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto">
        <label htmlFor="faq-search" className="sr-only">
          Search frequently asked questions
        </label>
        <input
          id="faq-search"
          type="search"
          placeholder="Search shipping, returns, payments, or warranty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input text-xs pl-10 pr-4 py-3"
        />
        <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="card p-8 text-center text-xs text-[var(--color-text-muted)] space-y-2">
            <p className="font-semibold text-[var(--color-text)]">No matching answers found</p>
            <p>Try searching with another word, or contact our support desk directly.</p>
            <Link to="/contact" className="btn-primary btn-sm inline-block mt-2">
              Contact Customer Care
            </Link>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="card border-[var(--color-border)] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  id={`faq-btn-${faq.id}`}
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] border border-[var(--color-border)]">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-primary)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faq.id}`}
                    className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6 text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help callout */}
      <div className="card p-6 bg-[var(--color-bg-subtle)] border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            Have a question that is not answered here?
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Our support representatives are ready to assist you by phone, email, or WhatsApp.
          </p>
        </div>

        <Link to="/contact" className="btn-primary btn-sm shrink-0">
          Reach Support Desk
        </Link>
      </div>

    </div>
  );
}

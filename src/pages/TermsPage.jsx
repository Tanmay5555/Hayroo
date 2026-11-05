import React from 'react';
import { FileText, Calendar, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

export default function TermsPage() {
  const lastUpdated = 'October 14, 2026';

  useSeo({
    title: 'Terms of Service & Conditions',
    description: 'Review the official terms of service, warranty conditions, shipping timelines, and returns policy for Hayroo.',
    canonicalPath: '/terms',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[var(--color-text)]">
      
      {/* Header */}
      <div className="space-y-3 border-b border-[var(--color-border)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          <FileText className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          Consumer Agreement
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--color-text)]">
          Terms and Conditions
        </h1>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card p-6 sm:p-10 bg-[var(--color-card)] border-[var(--color-border)] space-y-8 text-xs sm:text-sm leading-relaxed text-[var(--color-text-muted)]">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            1. Agreement and Overview
          </h2>
          <p>
            These Terms and Conditions govern your access to and purchase of items through the <strong>Hayroo</strong> ecommerce website operated by <strong>[my business details: Hayroo Retail Private Limited]</strong>. By browsing this store, creating an account, or placing an order, you agree to comply with and be bound by these terms.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            2. Product Information and Pricing
          </h2>
          <p>
            We strive to ensure all product specifications, images, and prices are accurate:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              All prices are listed in Indian Rupees (₹) and include applicable Goods and Services Tax (GST) unless explicitly noted.
            </li>
            <li>
              Product packaging and physical item color shades may vary slightly from online photography due to monitor settings and manufacturing runs.
            </li>
            <li>
              In the event of an inadvertent typographical error or system pricing error, we reserve the right to cancel affected orders and issue an immediate full refund.
            </li>
          </ul>
        </section>

        {/* Section 3: Shipping & Delivery Terms */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
            3. Shipping and Delivery Policy
          </h2>
          <p>
            Our logistics procedures are structured to ensure safe and prompt transit:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Order Dispatch:</strong> Verified orders are packed and dispatched within 24 to 48 hours from our central warehouse facilities.
            </li>
            <li>
              <strong>Delivery Timelines:</strong> Standard delivery takes approximately 3 to 5 business days for major Indian cities. Regional and rural destinations may require up to 7 business days.
            </li>
            <li>
              <strong>Free Shipping:</strong> Cart orders totaling ₹1,500 or greater qualify for free standard shipping. Orders below ₹1,500 are subject to a nominal delivery charge of ₹99.
            </li>
            <li>
              <strong>Failed Delivery Attempts:</strong> Couriers make up to three delivery attempts. If delivery fails due to incorrect address information or customer unavailability, the parcel returns to our hub and a refund minus round-trip logistics cost will be issued.
            </li>
          </ul>
        </section>

        {/* Section 4: Returns & Refunds Policy */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
            4. Returns, Replacements and Refund Policy
          </h2>
          <p>
            We back every customer purchase with a fair 30-day return policy:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Return Window:</strong> You can submit a return or replacement request within 30 days of parcel delivery.
            </li>
            <li>
              <strong>Eligible Conditions:</strong> Items must be in unblemished, original condition, accompanied by all factory accessories, user manuals, packaging inserts, and warranty tags.
            </li>
            <li>
              <strong>Non-Returnable Items:</strong> Consumable accessories (such as screen protectors once applied), hygienic in-ear audio pieces if unsealed, and software products cannot be accepted for return unless defective upon arrival.
            </li>
            <li>
              <strong>Return Pickup:</strong> We arrange courier pickup from your delivery address at no extra cost for verified defective, damaged, or mismatched items.
            </li>
            <li>
              <strong>Refund Timelines:</strong> Approved refunds are credited to the original payment source within 3 to 5 business days following physical receipt and warehouse inspection. Cash on Delivery refunds are credited to the customer's verified bank account or UPI ID.
            </li>
          </ul>
        </section>

        {/* Section 5: Warranty */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
            5. Brand Warranty and Service
          </h2>
          <p>
            All electronic items cataloged on Hayroo are 100% genuine and carry full official manufacturer warranty valid across India.
          </p>
          <p>
            Warranty claims after the initial 30-day return window are serviced directly by the respective brand's authorized service centers upon presentation of your Hayroo tax invoice.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted under applicable law, Hayroo Retail shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use cataloged products. Our total liability for any claim arising from an order is limited strictly to the purchase amount paid for that specific item.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            7. Governing Law and Jurisdiction
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, arbitration, or proceeding arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            8. Questions and Customer Inquiries
          </h2>
          <p>
            For questions concerning these Terms and Conditions or specific order agreements, please contact our legal and customer desk:
          </p>
          <div className="card p-4 bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-xs space-y-1">
            <p><strong>[my business details: Hayroo Legal and Customer Support]</strong></p>
            <p>Email: <strong>legal@hayroo.store</strong></p>
            <p>Phone: <strong>+91 98765 43210</strong></p>
            <p>Address: <strong>[my business details: Brigade Gateway, Malleshwaram, Bengaluru 560055, Karnataka]</strong></p>
          </div>
        </section>

      </div>

    </div>
  );
}

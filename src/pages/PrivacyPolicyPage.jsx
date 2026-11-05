import React from 'react';
import { ShieldCheck, Calendar, Lock, Mail, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 14, 2026';

  useSeo({
    title: 'Privacy Policy',
    description: 'Learn how Hayroo protects your personal data, handles secure payments, and uses cookies under the DPDP Act.',
    canonicalPath: '/privacy',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[var(--color-text)]">
      
      {/* Header */}
      <div className="space-y-3 border-b border-[var(--color-border)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          Legal and Privacy Compliance
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--color-text)]">
          Privacy Policy
        </h1>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="card p-6 sm:p-10 bg-[var(--color-card)] border-[var(--color-border)] space-y-8 text-xs sm:text-sm leading-relaxed text-[var(--color-text-muted)]">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            1. Introduction and Business Identity
          </h2>
          <p>
            Welcome to <strong>Hayroo</strong>. This Privacy Policy outlines how our business collects, utilizes, safeguards, and shares your personal data when you visit our website, register an account, or purchase products.
          </p>
          <div className="p-4 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs space-y-1">
            <p className="font-bold text-[var(--color-text)]">Registered Business Information:</p>
            <p>Entity Name: <strong>[my business details: Hayroo Retail Private Limited]</strong></p>
            <p>Registration / Corporate Identity: <strong>[my business details: CIN / GSTIN Number]</strong></p>
            <p>Registered Address: <strong>[my business details: Brigade Gateway, Malleshwaram, Bengaluru, Karnataka 560055]</strong></p>
            <p>Official Grievance Officer: <strong>[my business details: Grievance Officer Name, privacy@hayroo.store]</strong></p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            2. Personal Information We Collect
          </h2>
          <p>
            We collect only the information necessary to fulfill your orders, provide customer support, and maintain account security:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account & Contact Data:</strong> Your name, email address, contact telephone number, and login credentials.
            </li>
            <li>
              <strong>Delivery & Billing Details:</strong> Recipient name, complete postal address, city, state, postal pincode, and dispatch instructions.
            </li>
            <li>
              <strong>Order Records:</strong> Items purchased, transaction totals, date of purchase, invoice records, and return requests.
            </li>
            <li>
              <strong>Technical & Session Data:</strong> IP address, device type, browser specifications, and cookie preferences necessary for cart retention.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            3. How We Use Your Data
          </h2>
          <p>
            Your information is strictly processed for legitimate ecommerce and retail fulfillment purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Processing, packing, and dispatching your orders through licensed courier partners.</li>
            <li>Communicating order status updates, shipment tracking links, and electronic tax invoices.</li>
            <li>Assisting with customer support inquiries, warranty inquiries, and replacement requests.</li>
            <li>Preventing fraudulent transactions and verifying payment authenticity.</li>
            <li>Sending service notifications and promotional updates (only when you explicitly opt in).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            4. Payment Security and Processing
          </h2>
          <p>
            Online payments on Hayroo are handled via certified payment gateways (such as Razorpay) compliant with PCI-DSS Level 1 standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All transmissions use 256-bit SSL encryption.</li>
            <li>
              <strong>We never store, see, or process your raw payment credentials</strong> such as credit/debit card numbers, CVV security codes, or net banking passwords.
            </li>
            <li>Transactions are verified using two-factor authentication (OTP or bank challenge).</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            5. Cookies and Tracking Choices
          </h2>
          <p>
            Hayroo uses cookies to make our store function reliably:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Strictly Necessary Cookies:</strong> Essential for shopping cart persistence, authentication session state, and security tokens.
            </li>
            <li>
              <strong>Performance & Analytics Cookies:</strong> Used to understand site speed and visit volume. These cookies are <strong>never activated without your explicit consent</strong> via our cookie banner.
            </li>
          </ul>
          <p>
            You can change your cookie preferences at any time by clearing your browser cache or using the cookie choice options in your footer.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            6. Third-Party Data Sharing
          </h2>
          <p>
            We do not sell, rent, or trade your personal data to marketing brokers. We share data only with operational service partners required to fulfill your order:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Logistics & Courier Partners:</strong> (e.g. Blue Dart, Delhivery, India Post) to deliver packages to your physical address.
            </li>
            <li>
              <strong>Payment Processors:</strong> (e.g. Razorpay) to complete secure financial authorization.
            </li>
            <li>
              <strong>Statutory Authorities:</strong> Only when strictly required by applicable Indian laws, tax regulations, or court orders.
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            7. Your Legal Rights
          </h2>
          <p>
            You maintain full control over your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The right to inspect and update your registered account information.</li>
            <li>The right to request an export copy of your stored order records.</li>
            <li>The right to request deletion of your account and customer profile.</li>
            <li>The right to withdraw marketing consent at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, email our team at <strong>privacy@hayroo.store</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">
            8. Contact Details and Grievances
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to file a data inquiry, please contact our designated office:
          </p>
          <div className="card p-4 bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-xs space-y-1">
            <p><strong>[my business details: Hayroo Privacy & Legal Affairs]</strong></p>
            <p>Email: <strong>privacy@hayroo.store</strong></p>
            <p>Phone: <strong>+91 98765 43210</strong></p>
            <p>Postal Desk: <strong>[my business details: Brigade Gateway, Malleshwaram, Bengaluru 560055, Karnataka]</strong></p>
          </div>
        </section>

      </div>

    </div>
  );
}

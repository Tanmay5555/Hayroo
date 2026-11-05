import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSeo } from '../hooks/useSeo';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name (at least 2 letters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Please select or enter an inquiry subject'),
  orderNumber: z.string().optional(),
  message: z.string().min(10, 'Message details must be at least 10 characters long'),
});

export default function ContactPage() {
  useSeo({
    title: 'Contact Us & Customer Support',
    description: 'Get in touch with Hayroo support in Bengaluru. We assist with order tracking, product inquiries, returns, and corporate orders.',
    canonicalPath: '/contact',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      subject: 'Order Tracking & Delivery',
      orderNumber: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmittedData(data);
    setIsSubmitted(true);
    toast.success('Your message has been sent to Hayroo Customer Support!');
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          Direct Customer Care
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--color-text)]">
          Contact Hayroo Support
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
          Need assistance with an existing order, product technical details, or return requests? Our dedicated team is available to assist you Monday through Saturday.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact Directory & Address Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-[var(--color-card)] border-[var(--color-border)] space-y-5">
            <h2 className="text-base font-bold font-heading text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Office and Warehouse Directory
            </h2>

            <address className="not-italic space-y-4 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-text)] block mb-0.5">Physical Address</span>
                  <p>Hayroo Retail Private Limited</p>
                  <p>Brigade Gateway, Malleshwaram West</p>
                  <p>Bengaluru, Karnataka 560055, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-text)] block mb-0.5">Telephone and WhatsApp</span>
                  <p>Customer Desk: +91 98765 43210</p>
                  <p>Toll Free: 1800-123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-text)] block mb-0.5">Email Inquiries</span>
                  <p>Support: support@hayroo.store</p>
                  <p>Orders: orders@hayroo.store</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-text)] block mb-0.5">Operating Hours</span>
                  <p>Monday to Saturday: 9:00 AM to 7:00 PM IST</p>
                  <p>Sunday: Closed (Emails logged for Monday resolution)</p>
                </div>
              </div>
            </address>
          </div>

          {/* Response Promise Card */}
          <div className="card p-5 bg-[var(--color-bg-subtle)] border-[var(--color-border)] space-y-2">
            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
              Our Response Commitment
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              We respond to all tickets and email inquiries within 4 business hours. For urgent order cancellations or address adjustments, please reach us via telephone or WhatsApp.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 card p-6 sm:p-8 bg-[var(--color-card)] border-[var(--color-border)] shadow-sm space-y-6">
          
          <div className="border-b border-[var(--color-border)] pb-4">
            <h2 className="text-lg font-bold font-heading text-[var(--color-text)]">
              Send an Inquiry Message
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Fill out this form and a customer service representative will respond promptly.
            </p>
          </div>

          {/* Success State */}
          {isSubmitted && submittedData && (
            <div className="p-4 rounded-md bg-[#047857]/10 border border-[#047857]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#047857] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Message Received Successfully</span>
              </div>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Thank you, <strong className="text-[var(--color-text)]">{submittedData.fullName}</strong>. A support ticket has been opened under reference ID <strong className="font-mono text-[var(--color-text)]">#TKT-{Date.now().toString().slice(-6)}</strong>. We have dispatched a confirmation email to <strong className="text-[var(--color-text)]">{submittedData.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold text-[var(--color-primary)] underline pt-1"
              >
                Send another message
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-1">
                <label className="form-label form-label-required text-xs">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Patel"
                  {...register('fullName')}
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div className="form-group sm:col-span-1">
                <label className="form-label form-label-required text-xs">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  className="form-input text-xs"
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-1">
                <label className="form-label text-xs">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...register('phone')}
                  className="form-input text-xs"
                />
              </div>

              <div className="form-group sm:col-span-1">
                <label className="form-label text-xs">Order ID (If applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-12345"
                  {...register('orderNumber')}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required text-xs">Inquiry Topic</label>
              <select
                {...register('subject')}
                className="form-select text-xs"
              >
                <option value="Order Tracking & Delivery">Order Tracking and Delivery</option>
                <option value="Return or Exchange Request">Return or Exchange Request</option>
                <option value="Product Specification Question">Product Specification Question</option>
                <option value="Payment or Invoice Assistance">Payment or Invoice Assistance</option>
                <option value="Warranty Claim Support">Warranty Claim Support</option>
                <option value="General Feedback">General Feedback or Inquiries</option>
              </select>
              {errors.subject && <p className="form-error">{errors.subject.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required text-xs">Your Message Details</label>
              <textarea
                rows={5}
                placeholder="Please describe your question or issue in detail so we can provide a specific resolution..."
                {...register('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
                className="form-textarea text-xs"
              />
              {errors.message && <p className="form-error">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting Message...'
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Send Message to Support</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

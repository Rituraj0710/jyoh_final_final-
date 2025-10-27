"use client";
import React from "react";
import FormWrapper from "@/components/FormWrapper";

const ContactFormContent = ({ formData, onFieldChange, isSubmitting, isSaving }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => onFieldChange('fullName', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => onFieldChange('email', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={formData.subject || ''}
            onChange={(e) => onFieldChange('subject', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="billing">Billing Question</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          value={formData.message || ''}
          onChange={(e) => onFieldChange('message', e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your message here..."
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="newsletter"
          checked={formData.newsletter || false}
          onChange={(e) => onFieldChange('newsletter', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
          Subscribe to our newsletter for updates
        </label>
      </div>
    </div>
  );
};

export default function ContactForm() {
  const requiredFields = ['fullName', 'email', 'subject', 'message'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FormWrapper
          serviceType="contact-form"
          formTitle="Contact Us Form"
          formDescription="Get in touch with us for any questions or support"
          requiredFields={requiredFields}
          onFormSubmit={async (formData) => {
            // Custom submit logic can be added here
            console.log('Contact form submitted:', formData);
            return true; // Return true to proceed with API submission
          }}
        >
          <ContactFormContent />
        </FormWrapper>
      </div>
    </div>
  );
}

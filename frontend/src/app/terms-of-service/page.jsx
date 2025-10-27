'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'services', title: 'Nature of Service' },
    { id: 'user-responsibilities', title: 'User Responsibilities' },
    { id: 'payment-terms', title: 'Payments & Refunds' },
    { id: 'delivery-terms', title: 'Delivery Terms' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'limitation-liability', title: 'Limitation of Liability' },
    { id: 'changes-to-terms', title: 'Changes to Terms' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'contact', title: 'Contact Us' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Effective Date: 07-04-2025</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <span>Website: https://jyoh.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Overview */}
              <section id="overview" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Welcome to <strong>jyoh.in</strong>. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using any of our services.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 font-medium">
                      By using our website, services, or digital platforms, you acknowledge that you've read, understood, and agreed to these Terms & Conditions, along with our Privacy Policy. If you do not agree, please refrain from using our services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Acceptance of Terms */}
              <section id="acceptance" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By using our website, services, or digital platforms, you acknowledge that you've read, understood, and agreed to these Terms & Conditions, along with our Privacy Policy. If you do not agree, please refrain from using our services.
                  </p>
                </div>
              </section>

              {/* Nature of Service */}
              <section id="services" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Nature of Service</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    jyoh.in provides ready-to-use legal templates, online documentation, and eStamp paper procurement services for individual and business use. All content is created in alignment with applicable Indian legal frameworks but does not constitute legal advice.
                  </p>
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> Our services provide document templates and assistance. We do not provide legal advice. For complex legal matters, please consult with a qualified attorney.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section id="user-responsibilities" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Responsibilities</h2>
                <div className="prose prose-lg max-w-none">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>You are responsible for the accuracy of information submitted during documentation.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>You must ensure your use of the service complies with local laws and regulations.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Any misuse or fraudulent activity may lead to service suspension or legal action.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Payments & Refunds */}
              <section id="payment-terms" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Payments & Refunds</h2>
                <div className="prose prose-lg max-w-none">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>All services are prepaid.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Payments made once are non-refundable unless a technical error or non-delivery occurs from our end.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>In case of a failed transaction, users must contact support within 48 hours.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Delivery Terms */}
              <section id="delivery-terms" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Delivery Terms</h2>
                <div className="prose prose-lg max-w-none">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>eStamp paper and digital documents are delivered via email or courier, based on your selection.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Delivery timelines may vary depending on your location, availability of government services, and other third-party factors.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual-property" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All content, branding, designs, templates, and software used on this site are the intellectual property of jyoh.in or its licensors. Any unauthorized use or duplication is strictly prohibited.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation-liability" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Limitation of Liability</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
                    <p className="text-orange-700">
                      jyoh.in shall not be liable for any indirect, incidental, or consequential damages arising out of your use or inability to use our services. We do not guarantee the legal outcome of any document used via our platform.
                    </p>
                  </div>
                </div>
              </section>

              {/* Changes to Terms */}
              <section id="changes-to-terms" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Changes to Terms</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to update or modify these Terms & Conditions at any time. Any changes will be effective immediately upon posting. It is your responsibility to check this page regularly.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section id="governing-law" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Governing Law</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    These Terms shall be governed in accordance with the laws of the Republic of India. Any disputes will be subject to the jurisdiction of courts located in Dwarka, Delhi.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Contact Us</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For any concerns or queries regarding these Terms & Conditions, please reach out to us via:
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Email</p>
                          <a href="mailto:info@jyoh.in" className="text-blue-600 hover:text-blue-800 underline">info@jyoh.in</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Phone</p>
                          <a href="tel:+919355759494" className="text-blue-600 hover:text-blue-800 underline">+91-9355759494</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;

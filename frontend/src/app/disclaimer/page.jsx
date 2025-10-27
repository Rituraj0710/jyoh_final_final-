'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Disclaimer = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'not-law-firm', title: 'Not a Law Firm' },
    { id: 'document-accuracy', title: 'Document Accuracy and Usage' },
    { id: 'no-attorney-client', title: 'No Attorney-Client Relationship' },
    { id: 'third-party-services', title: 'Third-Party Services' },
    { id: 'limitation-liability', title: 'Limitation of Liability' },
    { id: 'external-links', title: 'External Links' },
    { id: 'changes-disclaimer', title: 'Changes to This Disclaimer' },
    { id: 'contact', title: 'Contact Us' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Disclaimer
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Important legal information about our services and limitations
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Effective Date: 07-04-2025</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                <span>Website: https://jyoh.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
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
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Overview */}
              <section id="overview" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The information provided by <strong>JYOH.IN</strong> ("we," "us" or "our") on <a href="https://jyoh.in" className="text-blue-600 hover:text-blue-800 underline">https://jyoh.in</a> (the "Website") is for general informational and legal form assistance purposes only. By using this website, you agree to the terms of this Disclaimer.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 font-medium">
                      Please read this disclaimer carefully before using our services. If you do not agree with any part of this disclaimer, please do not use our website.
                    </p>
                  </div>
                </div>
              </section>

              {/* Not a Law Firm */}
              <section id="not-law-firm" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Not a Law Firm</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    JYOH.IN is not a law firm, and we do not provide legal advice or representation. The content and services provided on this website are intended to assist users in preparing and registering basic legal documents through a standardized process.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-yellow-800 font-medium">
                      <strong>Important:</strong> If you require legal advice specific to your situation, we strongly recommend consulting a qualified legal professional.
                    </p>
                  </div>
                </div>
              </section>

              {/* Document Accuracy and Usage */}
              <section id="document-accuracy" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Document Accuracy and Usage</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    While we strive to provide accurate and up-to-date legal templates and services:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>We do not guarantee that any document generated or registered through our platform is suitable for your particular legal needs or will be accepted by all institutions or authorities.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>It is the user's responsibility to review and verify the accuracy of all details provided in any legal document before submission.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* No Attorney-Client Relationship */}
              <section id="no-attorney-client" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. No Attorney-Client Relationship</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                    <p className="text-red-700">
                      Use of this website or communication with us does not create an attorney-client relationship. We simply provide document generation and registration facilitation services based on user input.
                    </p>
                  </div>
                </div>
              </section>

              {/* Third-Party Services */}
              <section id="third-party-services" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Third-Party Services</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We may work with third-party service providers, including payment gateways and registration agents. While we choose our partners carefully, we are not responsible for any loss, error, or issue arising from third-party services.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation-liability" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Limitation of Liability</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Under no circumstances shall JYOH.IN, its owners, employees, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Use or misuse of our website or services.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Errors in documents generated based on user input.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Delay or failure in registration or legal acceptance of submitted documents.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* External Links */}
              <section id="external-links" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. External Links</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Our website may contain links to third-party websites. These links are provided for convenience only, and we do not endorse or take responsibility for the content or privacy practices of those sites.
                  </p>
                </div>
              </section>

              {/* Changes to This Disclaimer */}
              <section id="changes-disclaimer" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Changes to This Disclaimer</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify this Disclaimer at any time without prior notice. Continued use of the website after such changes constitutes your acceptance of the updated Disclaimer.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Us</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions or concerns regarding this Disclaimer, please contact us at:
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Website</p>
                          <a href="https://jyoh.in" className="text-blue-600 hover:text-blue-800 underline">https://jyoh.in</a>
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

export default Disclaimer;

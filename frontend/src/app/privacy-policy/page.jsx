'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'information-collection', title: 'Information We Collect' },
    { id: 'data-usage', title: 'How We Use Your Information' },
    { id: 'data-sharing', title: 'Data Sharing and Disclosure' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies and Tracking' },
    { id: 'third-party', title: 'Third-Party Links' },
    { id: 'children-privacy', title: "Children's Privacy" },
    { id: 'policy-changes', title: 'Changes to This Policy' },
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
              Privacy Policy
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
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact: info@jyoh.in</span>
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
                    At <strong>JYOH.IN</strong>, accessible from <a href="https://jyoh.in" className="text-blue-600 hover:text-blue-800 underline">https://jyoh.in</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by JYOH.IN and how we use it.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 font-medium">
                      By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                    </p>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="information-collection" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may collect and process the following types of information:
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Personal Information:</h3>
                      <p className="text-gray-700">Name, phone number, email address, address, identity proof details, and other relevant legal documentation.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Document Information:</h3>
                      <p className="text-gray-700">Details and contents related to your legal document requests such as rent agreements, affidavits, wills, etc.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Payment Information:</h3>
                      <p className="text-gray-700">While we do not store credit/debit card details, we may collect transaction details through our secure payment gateway partners.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Usage Data:</h3>
                      <p className="text-gray-700">IP address, browser type, operating system, referring URLs, pages viewed, and usage behavior on our website.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section id="data-usage" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the collected data for the following purposes:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>To provide legal document drafting and registration services.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>To improve and personalize user experience on the website.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>To process payments and generate invoices.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>To send important notifications, service-related messages, or document updates.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>To comply with legal obligations and regulatory requirements.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Data Sharing and Disclosure */}
              <section id="data-sharing" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Data Sharing and Disclosure</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell, trade, or rent your personal information to third parties. However, we may share your data with:
                  </p>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">Government Agencies</h3>
                      <p className="text-yellow-700">Government agencies or registration authorities for processing legal documents.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">Service Providers</h3>
                      <p className="text-yellow-700">Service providers and partners who assist in operating our website and fulfilling your requests, under confidentiality agreements.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">Legal Authorities</h3>
                      <p className="text-yellow-700">Legal authorities, if required to do so by law or to protect the rights and safety of JYOH.IN and its users.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-green-800 mb-2">Secure Data Protection</h3>
                        <p className="text-green-700">
                          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section id="your-rights" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Access Your Data</h3>
                      <p className="text-blue-700 text-sm">Access the personal data we hold about you.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Request Corrections</h3>
                      <p className="text-blue-700 text-sm">Request correction or deletion of inaccurate or outdated data.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Withdraw Consent</h3>
                      <p className="text-blue-700 text-sm">Withdraw consent to data processing (subject to legal limitations).</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Lodge Complaints</h3>
                      <p className="text-blue-700 text-sm">Lodge a complaint with a data protection authority.</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-700">
                      <strong>To exercise any of these rights, contact us at:</strong>{' '}
                      <a href="mailto:info@jyoh.in" className="text-blue-600 hover:text-blue-800 underline">info@jyoh.in</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section id="cookies" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cookies and Tracking</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    JYOH.IN may use cookies and similar technologies to enhance user experience, analyze usage, and deliver targeted services. Users can control cookie settings through their browser.
                  </p>
                </div>
              </section>

              {/* Third-Party Links */}
              <section id="third-party" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Third-Party Links</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices or the content of those external sites.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section id="children-privacy" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Children's Privacy</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                    <p className="text-orange-800">
                      Our services are not intended for individuals under the age of 18. We do not knowingly collect data from children.
                    </p>
                  </div>
                </div>
              </section>

              {/* Changes to This Policy */}
              <section id="policy-changes" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Changes to This Privacy Policy</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date."
                  </p>
                </div>
              </section>

              {/* Contact Us */}
              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Contact Us</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;

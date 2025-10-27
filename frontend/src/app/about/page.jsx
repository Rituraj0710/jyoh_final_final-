"use client"

import React from "react";
import Navbar from "@/components/Navbar";
import FooterPage from "@/components/Footer";
import Hero from "@/components/About/Hero";
import Section from "@/components/About/Section";
import ReachUs from "@/components/About/ReachUs";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Who We Are Section */}
        <Section
          title="Who We Are?"
          content="At jyoh.in, we are transforming the way India handles legal paperwork."
          details={[
            "Our platform enables users to create affidavits, rental agreements, declarations, and e-stamp papers online — quickly and securely.",
            "With a tech-first approach, we remove legal complexity, offering simplified, verified, and ready-to-use documents for individuals, businesses, and everyday needs — all at your fingertips."
          ]}
          icon="🏢"
          bgColor="bg-blue-50"
          iconColor="bg-blue-100"
          textColor="text-blue-600"
        />

        {/* Our Mission Section */}
        <Section
          title="Our Mission"
          content="At jyoh.in, our mission is to bridge the gap between the average citizen and the often intimidating world of legal documentation."
          details={[
            "We aim to empower individuals, entrepreneurs, tenants, and businesses by making legally valid documents accessible through a fast, transparent, and technology-driven platform.",
            "By removing the barriers of legal jargon, long queues, physical visits, and high consultancy costs, we are building a future where every Indian can create, download, and use legal documents from anywhere — confidently and independently.",
            "Our mission is not just to simplify paperwork, but to redefine the way India interacts with legal systems — making the process democratic, digital-first, and disruption-free"
          ]}
          icon="🎯"
          bgColor="bg-green-50"
          iconColor="bg-green-100"
          textColor="text-green-600"
          reverse={true}
        />

        {/* What We Offer Section */}
        <Section
          title="What We Offer"
          subtitle="Simplifying Legal Documentation for Everyone"
          content="At jyoh.in, we combine legal expertise with smart technology to deliver faster, easier, and more reliable documentation services — all from the comfort of your home."
          features={[
            "Ready-to-use legal templates",
            "Easy online form filling",
            "Digital & doorstep delivery of eStamp paper",
            "No hidden charges – fully transparent pricing",
            "100% legally compliant formats"
          ]}
          icon="⚡"
          bgColor="bg-purple-50"
          iconColor="bg-purple-100"
          textColor="text-purple-600"
        />

        {/* Why People Trust Us Section */}
        <Section
          title="Why People Trust Us?"
          features={[
            "100% legally compliant documents",
            "Smooth, error-free digital process",
            "Trusted by individuals, landlords & small businesses",
            "Eco-friendly, paperless documentation",
            "Built on privacy-first, secure technology"
          ]}
          icon="🛡️"
          bgColor="bg-orange-50"
          iconColor="bg-orange-100"
          textColor="text-orange-600"
          reverse={true}
        />

        {/* Disclaimer Section */}
        <Section
          title="Disclaimer"
          content="JYOH does not give any legal advice. We provide document templates and services to help you create legally compliant documents. For specific legal advice, please consult with a qualified legal professional."
          icon="⚠️"
          bgColor="bg-yellow-50"
          iconColor="bg-yellow-100"
          textColor="text-yellow-600"
          isDisclaimer={true}
        />
      </div>

      {/* Reach Us Section */}
      <ReachUs />
      
      {/* Footer */}
      <FooterPage />
    </div>
  );
};

export default AboutPage;

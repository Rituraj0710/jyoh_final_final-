"use client"

import React from "react";

const Hero = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Your Legal Documents.
            <span className="block text-blue-600">Simplified.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Transform the way you handle legal paperwork with our tech-first platform. 
            Create, download, and use legally compliant documents from anywhere — confidently and independently.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

"use client"

import React from "react";

const Section = ({ 
  title, 
  subtitle, 
  content, 
  details = [], 
  features = [], 
  icon, 
  bgColor = "bg-gray-50", 
  iconColor = "bg-gray-100", 
  textColor = "text-gray-600",
  reverse = false,
  isDisclaimer = false
}) => {
  return (
    <section className={`${bgColor} py-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          
          {/* Content */}
          <div className={`${reverse ? 'lg:col-start-2' : ''}`}>
            <div className="max-w-2xl">
              {/* Icon */}
              <div className={`w-16 h-16 ${iconColor} rounded-full flex items-center justify-center mb-6`}>
                <span className="text-2xl">{icon}</span>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
              
              {/* Subtitle */}
              {subtitle && (
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  {subtitle}
                </h3>
              )}
              
              {/* Main Content */}
              {content && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {content}
                </p>
              )}
              
              {/* Details */}
              {details.length > 0 && (
                <div className="space-y-4 mb-6">
                  {details.map((detail, index) => (
                    <p key={index} className="text-gray-600 leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              )}
              
              {/* Features List */}
              {features.length > 0 && (
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`w-2 h-2 ${textColor.replace('text-', 'bg-')} rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Visual Element */}
          <div className={`${reverse ? 'lg:col-start-1' : ''}`}>
            <div className="relative">
              {/* Decorative Background */}
              <div className={`absolute inset-0 ${iconColor} rounded-2xl transform rotate-3`}></div>
              
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="text-center">
                  <div className={`w-20 h-20 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <span className="text-3xl">{icon}</span>
                  </div>
                  
                  {isDisclaimer ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Legal Notice</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {content}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                      <p className="text-gray-600">
                        {subtitle || "Empowering you with legal solutions"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section;

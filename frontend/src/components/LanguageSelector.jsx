"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="language-selector flex items-center space-x-2">
      <span className="text-sm text-gray-600 font-medium">भाषा / Language:</span>
      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => handleLanguageChange("hi")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
            i18n.language === "hi"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          हिंदी
        </button>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
            i18n.language === "en"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;

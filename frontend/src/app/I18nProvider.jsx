"use client";

import { useEffect } from 'react';
import '../i18n';

export default function I18nProvider({ children }) {
  useEffect(() => {
    // i18n is initialized in the import above
  }, []);

  return <>{children}</>;
}

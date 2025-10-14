import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Static bundles (you can split by namespace later)
import en from "@/locales/en/common.json";
import ml from "@/locales/ml/common.json";

const resources = {
  en: { common: en },
  ml: { common: ml },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ml"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      // prefer your saved choice
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: "lang",
    },
  });

export default i18n;

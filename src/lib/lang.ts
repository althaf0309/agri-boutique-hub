export const LANG_KEY = "i18nLang";

export function getLang(): "en" | "ml" {
  const l = (localStorage.getItem(LANG_KEY) || "en").toLowerCase();
  return l === "ml" ? "ml" : "en";
}

export function setLang(lang: "en" | "ml") {
  localStorage.setItem(LANG_KEY, lang);
  const event = new CustomEvent("lang-change", { detail: lang });
  window.dispatchEvent(event);
}

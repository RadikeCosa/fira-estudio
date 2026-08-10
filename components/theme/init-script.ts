import { THEME_STORAGE_KEY } from "./theme";

export const themeInitScript = `
(function() {
  var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  var theme = "system";
  try {
    var storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      theme = storedTheme;
    }
  } catch (error) {}

  var systemTheme = "light";
  try {
    systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (error) {}

  var resolvedTheme = theme === "system" ? systemTheme : theme;
  var root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;
})();
`;

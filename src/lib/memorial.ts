export function getMemorialSlug() {
  const params = new URLSearchParams(window.location.search);
  let slug = params.get("memorial") || window.location.hostname.split(".")[0];
  if (slug === "localhost" || slug === "127" || !slug) {
    slug = params.get("memorial") || "demo";
  }
  return slug;
}

export function memorialQuery() {
  return `memorial=${getMemorialSlug()}`;
}

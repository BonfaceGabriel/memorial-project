import { createRoot } from "react-dom/client";
import "./index.css";

async function bootstrap() {
  const params = new URLSearchParams(window.location.search);
  let slug = params.get("memorial") || window.location.hostname.split(".")[0];
  if (slug === "localhost" || slug === "127" || !slug) {
    slug = params.get("memorial") || "demo";
  }
  const res = await fetch(`/memorial?memorial=${slug}`);
  const memorial = await res.json();
  const template = memorial.template_id || "default";
  const { default: App } = await import(
    /* @vite-ignore */ `./templates/${template}/App.tsx`
  );
  createRoot(document.getElementById("root")!).render(<App memorial={memorial} />);
}

bootstrap();

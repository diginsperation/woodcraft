import { useEffect } from "react";

export function Seo({ title, description, canonicalPath }: { title: string; description?: string; canonicalPath?: string }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
    if (canonicalPath) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      const url = new URL(window.location.href);
      url.pathname = canonicalPath;
      link.href = url.toString();
    }
  }, [title, description, canonicalPath]);
  return null;
}

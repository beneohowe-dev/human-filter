import type { Metadata } from "next";
import { docPages } from "@/lib/human-filter-data";

export const metadata: Metadata = {
  title: "Docs",
  description: "Open-source product, ethics, prompt and tone documentation for Human Filter."
};

export default function DocsPage() {
  return (
    <main className="docs-shell">
      <header className="site-header">
        <a href="/" className="wordmark" aria-label="Human Filter home">
          <span>Human</span> Filter
        </a>
        <nav className="top-nav" aria-label="Docs navigation">
          <a href="/filter">Try the filter</a>
          <a href="/">Home</a>
        </nav>
      </header>

      <section className="docs-hero">
        <p className="eyebrow">Open-source docs</p>
        <h1>How Human Filter thinks, what it avoids and where the line is.</h1>
      </section>

      <section className="docs-grid">
        {docPages.map((page) => (
          <a key={page.slug} className="doc-card" href={`/docs/${page.slug}`}>
            <h2>{page.title}</h2>
            <p>{page.description}</p>
          </a>
        ))}
      </section>
    </main>
  );
}

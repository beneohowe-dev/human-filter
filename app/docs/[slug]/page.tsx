import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docPages } from "@/lib/human-filter-data";

const docContent: Record<string, { title: string; sections: Array<{ heading: string; body: string[] }> }> = {
  "product-principles": {
    title: "Product Principles",
    sections: [
      {
        heading: "Core job",
        body: [
          "Human Filter helps people write with AI without sounding like AI.",
          "The product is a tone filter, not a post generator, content calendar or growth-hacking machine."
        ]
      },
      {
        heading: "Memory principle",
        body: [
          "The user should never have to remove the same AI habit twice.",
          "Corrections, banned phrases, accepted drafts and rejected wording should become local preferences."
        ]
      },
      {
        heading: "Shape",
        body: [
          "No login is required for version one.",
          "The app should be useful before setup and better after setup.",
          "Every extra feature must support the core filter."
        ]
      }
    ]
  },
  "ethical-use": {
    title: "Ethical Use",
    sections: [
      {
        heading: "Use honestly",
        body: [
          "Do not impersonate people.",
          "Do not clone someone's voice without permission.",
          "Do not scrape private messages without consent.",
          "Do not fabricate personal stories.",
          "Do not use this for spam."
        ]
      },
      {
        heading: "What this is not",
        body: [
          "Human Filter is not an AI detector.",
          "The goal is better, more honest writing, not sneaky manipulation."
        ]
      }
    ]
  },
  "agent-prompt": {
    title: "Agent Prompt",
    sections: [
      {
        heading: "Instruction",
        body: [
          "You are Human Filter. Your job is to help people write with AI without sounding like AI. Preserve the user's voice, remove generic phrasing, avoid obvious LinkedIn/AI tells, and make the writing specific, believable and human.",
          "Do not over-polish. Do not invent personal stories. If the idea is weak, improve the thinking rather than decorating it."
        ]
      },
      {
        heading: "Checks",
        body: [
          "Does this sound human?",
          "Does this sound too polished?",
          "Is there a real thought?",
          "Is there any lived detail?",
          "Is it too generic?",
          "Is it too LinkedIn?",
          "Is it trying too hard?",
          "Does it use banned phrases?",
          "Would the user cringe posting it?"
        ]
      }
    ]
  },
  "tone-modes": {
    title: "Tone Modes",
    sections: [
      {
        heading: "Default blend",
        body: [
          "Plain English, Less LinkedIn and Quietly confident are selected by default.",
          "Users can combine up to three modes so the output has direction without becoming a costume."
        ]
      },
      {
        heading: "Mode behavior",
        body: [
          "Less polished should keep some useful roughness.",
          "Blunt but fair should remove hedging without becoming mean.",
          "More personal should only use personal material present in the source or profile.",
          "Brave opinion should sharpen the thought, not invent controversy."
        ]
      }
    ]
  },
  "ai-tell-filter": {
    title: "AI Tell Filter",
    sections: [
      {
        heading: "Default tells",
        body: [
          "The filter watches for phrases like unlock, elevate, leverage, landscape, in today's fast-paced world, read that again and let that sink in.",
          "It also flags fake vulnerability, generic motivational endings, too many rhetorical questions and overly tidy structures."
        ]
      },
      {
        heading: "Not a score",
        body: [
          "The check is a writing aid, not a detector.",
          "Warnings should be helpful, specific and easy to act on."
        ]
      }
    ]
  }
};

export function generateStaticParams() {
  return docPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = docPages.find((item) => item.slug === slug);

  return {
    title: page?.title ?? "Docs"
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docContent[slug];

  if (!doc) {
    notFound();
  }

  return (
    <main className="docs-shell">
      <header className="site-header">
        <a href="/" className="wordmark" aria-label="Human Filter home">
          <span>Human</span> Filter
        </a>
        <nav className="top-nav" aria-label="Docs navigation">
          <a href="/docs">Docs</a>
          <a href="/filter">Try the filter</a>
        </nav>
      </header>

      <article className="doc-page">
        <a className="back-link" href="/docs">
          Back to docs
        </a>
        <h1>{doc.title}</h1>
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultBannedTells,
  defaultToneModes,
  defaultVoiceProfile,
  directnessLevels,
  feedbackOptions,
  imageTypes,
  inputTypes,
  outputTypes,
  polishLevels,
  toneModes,
  type RewriteRequest,
  type RewriteResponse,
  type VoiceProfile
} from "@/lib/human-filter-data";

const storageKeys = {
  profile: "human-filter.voice-profile",
  bannedTerms: "human-filter.banned-terms",
  memories: "human-filter.memories",
  preferredDrafts: "human-filter.preferred-drafts"
};

function asArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function splitTerms(value: string) {
  return value
    .split(/[,\n]/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function mergeUnique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function profileFromStorage(value: string | null): VoiceProfile {
  if (!value) return defaultVoiceProfile;

  try {
    const parsed = JSON.parse(value) as Partial<VoiceProfile>;
    return {
      ...defaultVoiceProfile,
      ...parsed,
      examples: [0, 1, 2].map((index) => parsed.examples?.[index] ?? "")
    };
  } catch {
    return defaultVoiceProfile;
  }
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <label className="field-label">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function ToneChip({
  tone,
  active,
  disabled,
  onClick
}: {
  tone: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`chip ${active ? "is-active" : ""}`}
      aria-pressed={active}
      disabled={disabled && !active}
      onClick={onClick}
    >
      {tone}
    </button>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function HumanFilterLogo() {
  return (
    <span className="logo-lockup">
      <svg className="logo-mark" viewBox="0 0 56 56" aria-hidden="true">
        <rect width="56" height="56" rx="13" />
        <circle cx="16" cy="17" r="4" />
        <circle cx="16" cy="29" r="4" />
        <circle cx="16" cy="41" r="4" />
        <path d="M20 17h11M20 29h11M20 41h11M31 17c5 0 8 3 8 8v3" />
        <path d="M36 28h8l-4-4m4 4-4 4" />
        <circle className="logo-face" cx="39" cy="38" r="9" />
        <circle className="logo-eye" cx="36" cy="36" r="1.5" />
        <circle className="logo-eye" cx="42" cy="36" r="1.5" />
        <path className="logo-smile" d="M35 41c3 3 6 3 9 0" />
      </svg>
      <span className="wordmark-text">
        <strong>Human</strong> Filter
      </span>
    </span>
  );
}

export function FilterApp() {
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState(inputTypes[0]);
  const [outputType, setOutputType] = useState(outputTypes[0]);
  const [selectedTones, setSelectedTones] = useState(defaultToneModes);
  const [customBannedTerms, setCustomBannedTerms] = useState<string[]>([]);
  const [newBannedTerm, setNewBannedTerm] = useState("");
  const [profile, setProfile] = useState<VoiceProfile>(defaultVoiceProfile);
  const [memories, setMemories] = useState<string[]>([]);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remembered, setRemembered] = useState("");
  const [correction, setCorrection] = useState("");
  const [imageType, setImageType] = useState(imageTypes[0]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageNotice, setImageNotice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const allVisibleBannedTerms = useMemo(
    () => mergeUnique([...defaultBannedTells, ...customBannedTerms, ...splitTerms(profile.neverUse)]),
    [customBannedTerms, profile.neverUse]
  );

  useEffect(() => {
    setProfile(profileFromStorage(window.localStorage.getItem(storageKeys.profile)));
    setCustomBannedTerms(asArray(window.localStorage.getItem(storageKeys.bannedTerms)));
    setMemories(asArray(window.localStorage.getItem(storageKeys.memories)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
  }, [hydrated, profile]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKeys.bannedTerms, JSON.stringify(customBannedTerms));
  }, [customBannedTerms, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKeys.memories, JSON.stringify(memories));
  }, [hydrated, memories]);

  function toggleTone(tone: string) {
    setSelectedTones((current) => {
      if (current.includes(tone)) {
        return current.filter((item) => item !== tone);
      }

      if (current.length >= 3) {
        return [...current.slice(1), tone];
      }

      return [...current, tone];
    });
  }

  function addBannedTerm(term = newBannedTerm) {
    const clean = term.trim();
    if (!clean) return;
    setCustomBannedTerms((current) => mergeUnique([...current, clean]));
    setNewBannedTerm("");
    setRemembered(`Added "${clean}" to the banned list.`);
  }

  function removeBannedTerm(term: string) {
    setCustomBannedTerms((current) => current.filter((item) => item !== term));
  }

  function updateProfile<K extends keyof VoiceProfile>(key: K, value: VoiceProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateExample(index: number, value: string) {
    setProfile((current) => ({
      ...current,
      examples: current.examples.map((example, exampleIndex) => (exampleIndex === index ? value : example))
    }));
  }

  function remember(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setMemories((current) => mergeUnique([clean, ...current]).slice(0, 24));
    setRemembered("Remembered for next time.");
  }

  async function generateRewrite() {
    if (!input.trim()) {
      setNotice("Paste a messy thought, draft or AI-written post first.");
      return;
    }

    setLoading(true);
    setNotice("");
    setRemembered("");
    setCopied(false);

    const payload: RewriteRequest = {
      input,
      inputType,
      outputType,
      toneModes: selectedTones,
      bannedTerms: customBannedTerms,
      memories,
      voiceProfile: profile
    };

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Something went wrong. Nothing was saved.");
        return;
      }

      setResult(data as RewriteResponse);
      setNotice("");
    } catch {
      setNotice("The filter could not run. Check the local server and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyMainVersion() {
    if (!result?.mainVersion) return;
    await navigator.clipboard.writeText(result.mainVersion);
    setCopied(true);
  }

  function savePreferredVersion() {
    if (!result?.mainVersion) return;
    const saved = window.localStorage.getItem(storageKeys.preferredDrafts);
    const drafts = asArray(saved);
    window.localStorage.setItem(storageKeys.preferredDrafts, JSON.stringify([result.mainVersion, ...drafts].slice(0, 12)));
    remember("User saved a preferred version.");
  }

  function handleFeedback(option: string) {
    if (option === "Never use this phrase again") {
      const phrase = window.prompt("Phrase to avoid next time?");
      if (phrase) addBannedTerm(phrase);
      return;
    }

    const memoryMap: Record<string, string> = {
      "Sounds like me": "User accepted this tone as close to their voice.",
      "Too polished": "User wants less polished rewrites.",
      "Too corporate": "User wants less corporate phrasing.",
      "Too emotional": "User wants less emotional phrasing.",
      "Too safe": "User wants braver, less hedged opinions.",
      "More blunt": "User prefers blunter edits.",
      "More curious": "User prefers more curious framing.",
      "More personal": "User wants more personal texture when provided by the source.",
      "Less LinkedIn": "User wants fewer LinkedIn-style patterns.",
      "Remember this edit": correction || "User wants this editing direction remembered."
    };

    remember(memoryMap[option] ?? option);
  }

  async function generateImagePrompt() {
    setImageLoading(true);
    setImageNotice("");
    setImageUrl("");

    try {
      const response = await fetch("/api/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: result?.mainVersion || input,
          imageType,
          toneModes: selectedTones
        })
      });
      const data = (await response.json()) as { prompt?: string };
      setImagePrompt(data.prompt ?? "");
    } catch {
      setImageNotice("Could not create an image prompt yet.");
    } finally {
      setImageLoading(false);
    }
  }

  async function generateImageDirectly() {
    const prompt = imagePrompt.trim();
    if (!prompt) {
      await generateImagePrompt();
      setImageNotice("Prompt created. Click generate image again if image generation is configured.");
      return;
    }

    setImageLoading(true);
    setImageNotice("");
    setImageUrl("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = (await response.json()) as { imageUrl?: string; notice?: string };
      setImageUrl(data.imageUrl ?? "");
      setImageNotice(data.notice ?? "");
    } catch {
      setImageNotice("Image generation failed. The prompt is still ready to copy.");
    } finally {
      setImageLoading(false);
    }
  }

  const suggestedPhrase = result?.suggestedMemory.match(/"([^"]+)"/)?.[1];

  return (
    <main className="app-shell">
      <header className="app-header">
        <a href="/" className="wordmark" aria-label="Human Filter home">
          <HumanFilterLogo />
        </a>
      </header>

      <section className="filter-hero">
        <div>
          <p className="eyebrow">LinkedIn draft cleaner</p>
          <h1>Make this sound human.</h1>
        </div>
        <p>Paste. Pick a tone. Generate the version you would actually post.</p>
      </section>

      <section className="filter-grid" aria-label="Human Filter workspace">
        <div className="control-panel">
          <div className="panel-section">
            <div className="section-heading">
              <h2>Draft</h2>
            </div>
            <div className="field-grid two">
              <div>
                <FieldLabel label="Input type" />
                <select value={inputType} onChange={(event) => setInputType(event.target.value)}>
                  {inputTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel label="Output type" />
                <select value={outputType} onChange={(event) => setOutputType(event.target.value)}>
                  {outputTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className="main-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste a rough thought, messy draft or AI-written post here..."
              aria-label="Text to filter"
            />
            <button type="button" className="primary-button generate-button" disabled={loading} onClick={generateRewrite}>
              {loading ? "Filtering..." : "Generate"}
            </button>
            {notice && <p className="notice">{notice}</p>}
            {remembered && <p className="notice success">{remembered}</p>}
          </div>

          <div className="panel-section">
            <div className="section-heading horizontal">
              <div>
                <h2>Tone</h2>
                <p>{selectedTones.join(", ") || "Choose up to 3"}.</p>
              </div>
              <span className="count-pill">{selectedTones.length}/3</span>
            </div>
            <div className="chip-row">
              {toneModes.map((tone) => (
                <ToneChip
                  key={tone}
                  tone={tone}
                  active={selectedTones.includes(tone)}
                  disabled={selectedTones.length >= 3}
                  onClick={() => toggleTone(tone)}
                />
              ))}
            </div>
          </div>

          <details className="compact-details">
            <summary>
              <span>Banned tells</span>
              <small>{allVisibleBannedTerms.length} active</small>
            </summary>
            <div className="compact-details-body">
            <div className="inline-form">
              <input
                value={newBannedTerm}
                onChange={(event) => setNewBannedTerm(event.target.value)}
                placeholder="Add a word or phrase to avoid"
                aria-label="New banned phrase"
              />
              <button type="button" className="secondary-button" onClick={() => addBannedTerm()}>
                Add
              </button>
            </div>
            <div className="banned-list" aria-label="Banned phrase list">
              {allVisibleBannedTerms.slice(0, 34).map((term) => (
                <span key={term} className={customBannedTerms.includes(term) ? "tag removable" : "tag"}>
                  {term}
                  {customBannedTerms.includes(term) && (
                    <button type="button" aria-label={`Remove ${term}`} onClick={() => removeBannedTerm(term)}>
                      x
                    </button>
                  )}
                </span>
              ))}
            </div>
            </div>
          </details>

          <details className="voice-profile compact-details">
            <summary>
              <span>Voice profile</span>
              <small>local</small>
            </summary>
            <div className="voice-profile-body">
              {profile.examples.map((example, index) => (
                <div key={index}>
                  <FieldLabel label={`Writing example ${index + 1}`} />
                  <textarea
                    value={example}
                    onChange={(event) => updateExample(index, event.target.value)}
                    placeholder="Paste a short example that sounds like you."
                  />
                </div>
              ))}
              <div>
                <FieldLabel label="Writing you hate" />
                <textarea
                  value={profile.dislikedExample}
                  onChange={(event) => updateProfile("dislikedExample", event.target.value)}
                  placeholder="Paste an example that sounds too AI, too polished or just wrong."
                />
              </div>
              <div>
                <FieldLabel label="Words or phrases never to use" />
                <textarea
                  value={profile.neverUse}
                  onChange={(event) => updateProfile("neverUse", event.target.value)}
                  placeholder="One per line, or comma-separated."
                />
              </div>
              <div>
                <FieldLabel label="What people should trust you for" />
                <input
                  value={profile.trustedFor}
                  onChange={(event) => updateProfile("trustedFor", event.target.value)}
                  placeholder="Example: practical product judgement, honest founder lessons..."
                />
              </div>
              <div className="field-grid two">
                <div>
                  <FieldLabel label="Preferred polish" />
                  <select
                    value={profile.polish}
                    onChange={(event) => updateProfile("polish", event.target.value as VoiceProfile["polish"])}
                  >
                    {polishLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel label="Preferred directness" />
                  <select
                    value={profile.directness}
                    onChange={(event) => updateProfile("directness", event.target.value as VoiceProfile["directness"])}
                  >
                    {directnessLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="output-panel">
          <section className="output-card primary-output">
            <div className="section-heading horizontal">
              <div>
                <h2>Post</h2>
              </div>
              <div className="action-row">
                <button type="button" className="secondary-button" disabled={!result?.mainVersion} onClick={copyMainVersion}>
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className="secondary-button" disabled={!result?.mainVersion} onClick={savePreferredVersion}>
                  Save preferred
                </button>
              </div>
            </div>
            {result?.mainVersion ? (
              <article className="rewritten-text">{result.mainVersion}</article>
            ) : (
              <EmptyState>Your cleaned-up LinkedIn post appears here.</EmptyState>
            )}
          </section>

          <section className="output-card">
            <h2>Rougher</h2>
            {result?.rougherVersion ? (
              <article className="rewritten-text rough">{result.rougherVersion}</article>
            ) : (
              <EmptyState>A less polished option appears here.</EmptyState>
            )}
          </section>

          <section className="output-card">
            <div className="section-heading">
              <h2>Check</h2>
            </div>
            {result ? (
              <div className="check-grid">
                <div>
                  <h3>Removed</h3>
                  <ul>
                    {result.check.removed.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Kept</h3>
                  <ul>
                    {result.check.kept.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Remaining risk</h3>
                  <ul>
                    {result.check.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Specificity</h3>
                  <p>{result.check.specificity}</p>
                  <h3>Polish</h3>
                  <p>{result.check.polish}</p>
                </div>
              </div>
            ) : (
              <EmptyState>Warnings appear here.</EmptyState>
            )}
          </section>

          <section className="output-card">
            <div className="section-heading">
              <h2>Memory</h2>
            </div>
            {result?.suggestedMemory ? (
              <>
                <p className="memory-suggestion">{result.suggestedMemory}</p>
                <div className="action-row wrap">
                  <button type="button" className="secondary-button" onClick={() => remember(result.suggestedMemory)}>
                    Remember this
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setRemembered("Ignored.")}>
                    Ignore
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!suggestedPhrase}
                    onClick={() => suggestedPhrase && addBannedTerm(suggestedPhrase)}
                  >
                    Add to banned list
                  </button>
                </div>
              </>
            ) : (
              <EmptyState>One preference to save appears here.</EmptyState>
            )}
          </section>

          <details className="output-card compact-details">
            <summary>
              <span>Feedback</span>
              <small>teach it</small>
            </summary>
            <div className="compact-details-body">
            <textarea
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
              placeholder="Example: make openings shorter and less motivational."
            />
            <div className="feedback-grid">
              {feedbackOptions.map((option) => (
                <button key={option} type="button" className="feedback-button" onClick={() => handleFeedback(option)}>
                  {option}
                </button>
              ))}
            </div>
            {memories.length > 0 && (
              <div className="memory-list">
                <h3>Remembered locally</h3>
                {memories.slice(0, 6).map((memory) => (
                  <span key={memory}>{memory}</span>
                ))}
              </div>
            )}
            </div>
          </details>

          <details className="output-card image-panel compact-details">
            <summary>
              <span>Image</span>
              <small>prompt or generate</small>
            </summary>
            <div className="compact-details-body">
            <div className="field-grid two">
              <div>
                <FieldLabel label="Image direction" />
                <select value={imageType} onChange={(event) => setImageType(event.target.value)}>
                  {imageTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="image-actions">
                <button type="button" className="secondary-button" disabled={imageLoading} onClick={generateImagePrompt}>
                  Generate prompt
                </button>
                <button type="button" className="secondary-button" disabled={imageLoading} onClick={generateImageDirectly}>
                  Generate image
                </button>
              </div>
            </div>
            {imagePrompt ? (
              <textarea
                className="image-prompt"
                value={imagePrompt}
                onChange={(event) => setImagePrompt(event.target.value)}
                aria-label="Generated image prompt"
              />
            ) : (
              <EmptyState>Generate image prompt only, or generate directly if image generation is configured.</EmptyState>
            )}
            {imageNotice && <p className="notice">{imageNotice}</p>}
            {imageUrl && <img className="generated-image" src={imageUrl} alt="Generated supporting visual" />}
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

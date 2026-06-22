import {
  defaultBannedTells,
  defaultVoiceProfile,
  imageSafetyRules,
  type ImagePromptRequest,
  type RewriteRequest,
  type RewriteResponse
} from "./human-filter-data";

const replacementMap: Record<string, string> = {
  authentic: "real",
  leverage: "use",
  utilize: "use",
  unlock: "open up",
  elevate: "improve",
  landscape: "space",
  "game-changing": "useful",
  transformative: "meaningful",
  seamless: "smooth",
  foster: "build",
  delve: "look at"
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function termsFromProfile(request: RewriteRequest) {
  const profileTerms =
    request.voiceProfile?.neverUse
      ?.split(/[,\n]/)
      .map((term) => term.trim())
      .filter(Boolean) ?? [];

  return unique([...defaultBannedTells, ...request.bannedTerms, ...profileTerms]);
}

export function analyseTells(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  const phraseMatches = terms.filter((term) => lower.includes(term.toLowerCase()));
  const rhetoricalQuestions = (text.match(/\?/g) ?? []).length;
  const emDashes = (text.match(/--|—/g) ?? []).length;
  const hyphenStacks = (text.match(/\b\w+-\w+-\w+\b/g) ?? []).length;
  const numberedStructure = /\b(1\.|first,|second,|third,|three things|3 things)\b/i.test(text);
  const genericEnding = /(let that sink in|read that again|the future is|it starts with|take action|level up|unlock your potential)/i.test(text);
  const fakeVulnerability = /(i'll be honest|vulnerable moment|truth bomb|hot take)/i.test(text);

  const warnings = [
    ...phraseMatches.map((term) => `Contains banned or tired phrase: "${term}"`),
    rhetoricalQuestions > 2 ? "Uses a lot of rhetorical questions." : "",
    emDashes > 1 ? "Relies on em dashes or dash-heavy rhythm." : "",
    hyphenStacks > 1 ? "Uses several stacked hyphen phrases." : "",
    numberedStructure ? "Looks like a tidy numbered blog structure." : "",
    genericEnding ? "Ending risks sounding motivational or generic." : "",
    fakeVulnerability ? "Vulnerability cue may feel staged." : ""
  ].filter(Boolean);

  return {
    phraseMatches,
    warnings,
    rhetoricalQuestions,
    emDashes,
    hyphenStacks,
    numberedStructure,
    genericEnding,
    fakeVulnerability
  };
}

function removeTiredPhrases(text: string, terms: string[]) {
  let next = text;

  next = next
    .replace(/in today'?s fast-paced world[:,]?\s*/gi, "")
    .replace(/here'?s the thing[:,]?\s*/gi, "")
    .replace(/this got me thinking[:,]?\s*/gi, "")
    .replace(/read that again\.?/gi, "")
    .replace(/let that sink in\.?/gi, "");

  for (const [phrase, replacement] of Object.entries(replacementMap)) {
    next = next.replace(new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi"), replacement);
  }

  for (const term of terms) {
    if (replacementMap[term.toLowerCase()]) continue;
    next = next.replace(new RegExp(escapeRegExp(term), "gi"), "");
  }

  return next
    .replace(/\s+--\s+/g, ". ")
    .replace(/\s+—\s+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/(^|[.!?]\s+)[,.:;]\s*/g, "$1")
    .trim();
}

function shapeForOutput(sentences: string[], request: RewriteRequest) {
  const wantsShort = request.outputType === "Short post";
  const wantsCarousel = request.outputType === "Carousel outline";
  const wantsDirect = request.toneModes.includes("More direct") || request.toneModes.includes("Blunt but fair");
  const wantsPersonal = request.toneModes.includes("More personal") || request.inputType === "Personal reflection";
  const wantsCurious = request.toneModes.includes("Curious storyteller") || request.toneModes.includes("Creative thinker");
  const maxSentences = wantsShort ? 5 : 9;
  const selected = sentences.slice(0, maxSentences);

  if (wantsCarousel) {
    const slides = selected.slice(0, 6).map((sentence, index) => `${index + 1}. ${sentenceCase(sentence)}`);
    return ["Carousel outline", "", ...slides].join("\n");
  }

  const paragraphs: string[] = [];
  const first = selected.shift();

  if (first) {
    paragraphs.push(sentenceCase(first));
  }

  while (selected.length) {
    const chunk = selected.splice(0, wantsShort ? 1 : 2);
    paragraphs.push(chunk.map(sentenceCase).join(" "));
  }

  if (wantsPersonal && !/\b(I|me|my|we|our)\b/.test(paragraphs.join(" "))) {
    paragraphs.unshift("The useful bit is not the polish. It is the specific thought underneath.");
  }

  if (wantsCurious && !paragraphs.some((paragraph) => paragraph.includes("?"))) {
    paragraphs.push("The question I keep coming back to: what would make this feel true in practice?");
  }

  if (wantsDirect) {
    return paragraphs
      .map((paragraph) => paragraph.replace(/^(I think|Maybe|Perhaps|It might be that)\s+/i, ""))
      .join("\n\n");
  }

  return paragraphs.join("\n\n");
}

function addHumanTexture(text: string, request: RewriteRequest) {
  const trustedFor = request.voiceProfile?.trustedFor?.trim();
  const polish = request.voiceProfile?.polish ?? "natural";
  let next = text;

  if (trustedFor && !next.toLowerCase().includes(trustedFor.toLowerCase())) {
    next += `\n\nWhat matters here is trust: ${trustedFor}.`;
  }

  if (request.toneModes.includes("Less LinkedIn")) {
    next = next.replace(/I am excited to share/gi, "I wanted to share");
    next = next.replace(/thrilled/gi, "glad");
    next = next.replace(/journey/gi, "work");
  }

  if (request.toneModes.includes("Dry and understated")) {
    next = next.replace(/!/g, ".");
  }

  if (polish === "rough") {
    next = next.replace(/\n\n/g, "\n");
  }

  return next.trim();
}

export function localRewrite(request: RewriteRequest): RewriteResponse {
  const terms = termsFromProfile(request);
  const cleaned = removeTiredPhrases(request.input, terms);
  const sentences = splitSentences(cleaned.length > 0 ? cleaned : request.input);
  const fallbackSentences =
    sentences.length > 0
      ? sentences
      : ["Start with the real thought, then cut anything that sounds borrowed."];
  const roughRequest: RewriteRequest = {
    ...request,
    outputType: request.outputType === "Carousel outline" ? "Short post" : request.outputType,
    toneModes: unique([...request.toneModes, "Less polished", "Raw thought"]),
    voiceProfile: { ...defaultVoiceProfile, ...request.voiceProfile, polish: "rough" }
  };

  const mainVersion = addHumanTexture(shapeForOutput(fallbackSentences, request), request);
  const rougherVersion = addHumanTexture(
    shapeForOutput(fallbackSentences.slice(0, Math.max(3, Math.ceil(fallbackSentences.length / 2))), roughRequest).replace(/\n\n/g, "\n"),
    roughRequest
  );

  const originalAnalysis = analyseTells(request.input, terms);
  const finalAnalysis = analyseTells(mainVersion, terms);
  const specificitySignals = /\b(yesterday|today|client|team|customer|founder|operator|week|month|project|meeting|call|I|we|my|our)\b/i.test(mainVersion);
  const tooPolished = /(seamless|elevate|unlock|transformative|world-class|best-in-class|game-changing)/i.test(mainVersion);

  const suggestedMemory =
    originalAnalysis.phraseMatches.length > 0
      ? `User dislikes "${originalAnalysis.phraseMatches[0]}".`
      : request.toneModes.includes("Less LinkedIn")
        ? "User prefers shorter, less polished LinkedIn-style posts."
        : request.toneModes.includes("Blunt but fair")
          ? "User prefers direct edits that do not soften the point too much."
          : "User prefers plain, specific writing over generic polish.";

  return {
    configured: false,
    notice: "Text generation is not configured yet. Add your API key in environment variables. Showing a local preview for now.",
    mainVersion,
    rougherVersion,
    check: {
      removed: originalAnalysis.phraseMatches.length
        ? originalAnalysis.phraseMatches
        : ["Generic polish and obvious AI rhythm were reduced where possible."],
      kept: [
        "The original idea and order of thought.",
        request.toneModes.length ? `Tone direction: ${request.toneModes.join(", ")}.` : "Plain English tone."
      ],
      risks: finalAnalysis.warnings.length
        ? finalAnalysis.warnings
        : ["This may still need one concrete detail only you can add."],
      specificity: specificitySignals
        ? "Specific enough to feel grounded, but one lived detail would make it stronger."
        : "Could use a concrete detail: a moment, example, person, place or decision.",
      polish: tooPolished ? "Still a little polished." : "Not over-polished."
    },
    warnings: finalAnalysis.warnings,
    suggestedMemory
  };
}

export function buildAgentPrompt(request: RewriteRequest) {
  const terms = termsFromProfile(request);
  return `You are Human Filter. Your job is to help people write with AI without sounding like AI. Preserve the user's voice, remove generic phrasing, avoid obvious LinkedIn/AI tells, and make the writing specific, believable and human. Do not over-polish. Do not invent personal stories. If the idea is weak, improve the thinking rather than decorating it.

Always check:
- Does this sound human?
- Does this sound too polished?
- Is there a real thought?
- Is there any lived detail?
- Is it too generic?
- Is it too LinkedIn?
- Is it trying too hard?
- Does it use banned phrases?
- Would the user cringe posting it?

Return strict JSON with these keys: mainVersion, rougherVersion, check, warnings, suggestedMemory.

Input type: ${request.inputType}
Output type: ${request.outputType}
Tone modes: ${request.toneModes.join(", ")}
Banned words and phrases: ${terms.join(", ")}
Saved memories: ${request.memories.join("; ") || "none"}
Voice examples: ${request.voiceProfile?.examples?.filter(Boolean).join("\n---\n") || "none"}
Disliked writing example: ${request.voiceProfile?.dislikedExample || "none"}
Trusted for: ${request.voiceProfile?.trustedFor || "not provided"}
Preferred polish: ${request.voiceProfile?.polish || "natural"}
Preferred directness: ${request.voiceProfile?.directness || "balanced"}

Text:
${request.input}`;
}

export function buildImagePrompt(request: ImagePromptRequest) {
  const cleanPost = request.post.trim().slice(0, 1200);
  const tone = request.toneModes.length ? request.toneModes.join(", ") : "Plain English";

  return [
    `Create a ${request.imageType.toLowerCase()} for a thoughtful LinkedIn post.`,
    `Direction: editorial, human, grounded, clean, slightly conceptual, not overdesigned.`,
    `Tone: ${tone}.`,
    `Use the post as context, but do not add fake people, fake screenshots, brand logos or documentary claims.`,
    `Visual idea: a quiet, specific work moment or simple metaphor that supports the thought without explaining it too hard.`,
    `Composition: lots of breathing room, natural light, restrained palette, crisp focal point, suitable for a professional feed.`,
    `Avoid: ${imageSafetyRules.join("; ")}.`,
    cleanPost ? `Post context: ${cleanPost}` : "Post context: not provided."
  ].join("\n");
}

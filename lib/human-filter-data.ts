export type VoiceProfile = {
  examples: string[];
  dislikedExample: string;
  neverUse: string;
  trustedFor: string;
  polish: "rough" | "natural" | "clean" | "sharp";
  directness: "gentle" | "balanced" | "direct" | "blunt but fair";
};

export type RewriteRequest = {
  input: string;
  inputType: string;
  outputType: string;
  toneModes: string[];
  bannedTerms: string[];
  memories: string[];
  voiceProfile?: VoiceProfile;
};

export type RewriteResponse = {
  configured: boolean;
  notice?: string;
  mainVersion: string;
  rougherVersion: string;
  check: {
    removed: string[];
    kept: string[];
    risks: string[];
    specificity: string;
    polish: string;
  };
  warnings: string[];
  suggestedMemory: string;
};

export type ImagePromptRequest = {
  post: string;
  imageType: string;
  toneModes: string[];
};

export const inputTypes = [
  "Rough thought",
  "Draft post",
  "AI-generated post",
  "Voice note transcript",
  "Email/message to turn into post",
  "Personal reflection"
];

export const outputTypes = [
  "LinkedIn post",
  "Short post",
  "Personal essay note",
  "Founder update",
  "Email/message",
  "Carousel outline"
];

export const toneModes = [
  "Raw thought",
  "Less polished",
  "Curious storyteller",
  "Blunt but fair",
  "Warm but not soft",
  "Dry and understated",
  "Quietly confident",
  "More personal",
  "More direct",
  "Less LinkedIn",
  "Creative thinker",
  "Founder/operator",
  "Plain English",
  "Soft challenge",
  "Brave opinion"
];

export const defaultToneModes = ["Plain English", "Less LinkedIn", "Quietly confident"];

export const polishLevels: VoiceProfile["polish"][] = ["rough", "natural", "clean", "sharp"];

export const directnessLevels: VoiceProfile["directness"][] = [
  "gentle",
  "balanced",
  "direct",
  "blunt but fair"
];

export const defaultVoiceProfile: VoiceProfile = {
  examples: ["", "", ""],
  dislikedExample: "",
  neverUse: "",
  trustedFor: "",
  polish: "natural",
  directness: "balanced"
};

export const defaultBannedTells = [
  "in today's fast-paced world",
  "authentic",
  "unlock",
  "elevate",
  "leverage",
  "landscape",
  "game-changing",
  "this got me thinking",
  "here's the thing",
  "read that again",
  "let that sink in",
  "not just",
  "but a",
  "properly",
  "delve",
  "seamless",
  "transformative",
  "at the end of the day",
  "more than ever",
  "it is important to note",
  "foster",
  "utilize"
];

export const structuralTells = [
  "Overly neat question-answer blog structure",
  "Fake vulnerability",
  "Generic motivational ending",
  "Too many rhetorical questions",
  "Unnecessary em dashes",
  "Unnecessary hyphens",
  "Overly tidy three-part structure",
  "Abstract advice with no lived detail",
  "Fake question-answer blog phrasing"
];

export const feedbackOptions = [
  "Sounds like me",
  "Too polished",
  "Too corporate",
  "Too emotional",
  "Too safe",
  "More blunt",
  "More curious",
  "More personal",
  "Less LinkedIn",
  "Never use this phrase again",
  "Remember this edit"
];

export const imageTypes = [
  "Simple quote card",
  "Editorial metaphor",
  "Minimal carousel cover",
  "Human work moment",
  "Abstract but warm visual",
  "Black and white thought-led image",
  "Post thumbnail concept"
];

export const imageSafetyRules = [
  "No fake screenshots",
  "No fake real people",
  "No misleading documentary-style images",
  "No copyrighted brand logos unless rights are provided",
  "No generic AI-gloss visuals",
  "No cheesy corporate stock imagery",
  "No robot hands",
  "No glowing brains",
  "No futuristic nonsense"
];

export const docPages = [
  {
    slug: "product-principles",
    title: "Product Principles",
    description: "The choices that keep Human Filter small, useful and honest."
  },
  {
    slug: "ethical-use",
    title: "Ethical Use",
    description: "Clear limits for voice, consent, honesty and spam."
  },
  {
    slug: "agent-prompt",
    title: "Agent Prompt",
    description: "The working instruction for the Human Filter rewrite agent."
  },
  {
    slug: "tone-modes",
    title: "Tone Modes",
    description: "The tone palette and how combined modes should behave."
  },
  {
    slug: "ai-tell-filter",
    title: "AI Tell Filter",
    description: "Default phrases, patterns and checks the app watches for."
  }
];

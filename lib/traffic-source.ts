const AI_REFERRER_DOMAINS: ReadonlyArray<readonly [string, string]> = [
  ["chatgpt.com", "ChatGPT"],
  ["chat.openai.com", "ChatGPT"],
  ["openai.com", "OpenAI"],
  ["perplexity.ai", "Perplexity"],
  ["gemini.google.com", "Gemini"],
  ["bard.google.com", "Gemini"],
  ["aistudio.google.com", "Google AI"],
  ["ai.google.dev", "Google AI"],
  ["copilot.microsoft.com", "Microsoft Copilot"],
  ["claude.ai", "Claude"],
  ["anthropic.com", "Anthropic"],
];

const AI_UTM_SOURCES: Readonly<Record<string, string>> = {
  chatgpt: "ChatGPT", "chatgpt.com": "ChatGPT", "chat.openai.com": "ChatGPT",
  openai: "OpenAI", "openai.com": "OpenAI",
  perplexity: "Perplexity", "perplexity.ai": "Perplexity",
  gemini: "Gemini", "google-ai": "Google AI", googleai: "Google AI",
  copilot: "Microsoft Copilot", "microsoft-copilot": "Microsoft Copilot",
  claude: "Claude", "claude.ai": "Claude", anthropic: "Anthropic",
};

function normalizedDomain(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

export function classifyAiReferrerDomain(domain: string | null | undefined): string | null {
  if (!domain?.trim()) return null;
  const normalized = normalizedDomain(domain);
  for (const [knownDomain, label] of AI_REFERRER_DOMAINS) {
    if (normalized === knownDomain || normalized.endsWith(`.${knownDomain}`)) return label;
  }
  return null;
}

export function classifyAiUtmSource(source: string | null | undefined): string | null {
  if (!source?.trim()) return null;
  return AI_UTM_SOURCES[source.trim().toLowerCase().replace(/[_\s]+/g, "-")] ?? null;
}

export function analyticsSourceLabel({ utmSource, referrerDomain }: { utmSource?: string | null; referrerDomain?: string | null }) {
  return classifyAiUtmSource(utmSource) ?? classifyAiReferrerDomain(referrerDomain) ?? referrerDomain?.trim() ?? "Direct";
}

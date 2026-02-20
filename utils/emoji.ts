import emojiData from '@/assets/emojis/emojis.json';

type EmojiEntry = { names: string[]; surrogates: string; skins?: { names: string[]; surrogates: string }[] };
type EmojiCategory = EmojiEntry[];

// ─── Build lookup maps at module init ────────────────────────────

const nameToSurrogates = new Map<string, string>();
/** Primary (first) name only, no skin tones — used for autocomplete search. */
const primaryEmojis: EmojiMatch[] = [];

for (const category of Object.values(emojiData) as EmojiCategory[]) {
  for (const entry of category) {
    for (const name of entry.names) {
      nameToSurrogates.set(name, entry.surrogates);
    }
    primaryEmojis.push({ name: entry.names[0], surrogates: entry.surrogates });
    if (entry.skins) {
      for (const skin of entry.skins) {
        for (const name of skin.names) {
          nameToSurrogates.set(name, skin.surrogates);
        }
      }
    }
  }
}

/** Resolve a shortcode name (without colons) to its Unicode surrogates. */
export function resolveEmoji(name: string): string | null {
  return nameToSurrogates.get(name) ?? null;
}

export type EmojiMatch = { name: string; surrogates: string };

/** Search emoji names. Prefix matches are ranked first, then substring matches. */
export function searchEmojis(query: string, limit = 20): EmojiMatch[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const prefix: EmojiMatch[] = [];
  const contains: EmojiMatch[] = [];
  for (const entry of primaryEmojis) {
    if (entry.name.startsWith(q)) {
      prefix.push(entry);
    } else if (entry.name.includes(q)) {
      contains.push(entry);
    }
  }
  return [...prefix, ...contains].slice(0, limit);
}

/** Convert a Unicode emoji string to its SVG filename (without extension). */
export function emojiToFilename(surrogates: string): string {
  const codepoints: string[] = [];
  for (const char of surrogates) {
    const hex = char.codePointAt(0)!.toString(16);
    if (hex !== 'fe0f') codepoints.push(hex);
  }
  return codepoints.join('-');
}

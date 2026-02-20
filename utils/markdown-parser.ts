import { useEmojiStore } from '@/stores/emoji-store';
import { resolveEmoji } from '@/utils/emoji';

// ─── AST node types ──────────────────────────────────────────────

export type TextNode = { type: 'Text'; content: string };
export type BoldNode = { type: 'Bold'; children: InlineNode[] };
export type ItalicNode = { type: 'Italic'; children: InlineNode[] };
export type UnderlineNode = { type: 'Underline'; children: InlineNode[] };
export type StrikethroughNode = { type: 'Strikethrough'; children: InlineNode[] };
export type SpoilerNode = { type: 'Spoiler'; children: InlineNode[] };
export type InlineCodeNode = { type: 'InlineCode'; content: string };
export type TimestampNode = { type: 'Timestamp'; timestamp: number; style: string };
export type MentionNode = { type: 'Mention'; kind: { kind: 'User' | 'Channel' | 'Role'; id: string } };
export type UnicodeEmojiKind = { kind: 'Unicode'; name: string; surrogates: string };
export type CustomEmojiKind = { kind: 'Custom'; name: string; id: string };
export type EmojiNode = { type: 'Emoji'; kind: UnicodeEmojiKind | CustomEmojiKind };

export type HeadingNode = { type: 'Heading'; level: number; children: InlineNode[] };
export type CodeBlockNode = { type: 'CodeBlock'; content: string; language?: string };
export type BlockquoteNode = { type: 'Blockquote'; children: InlineNode[] };
export type AlertNode = { type: 'Alert'; alertType: string; children: InlineNode[] };
export type ListNode = { type: 'List'; ordered: boolean; items: ListItemNode[] };
export type ListItemNode = { children: InlineNode[]; ordinal?: number };
export type SubtextNode = { type: 'Subtext'; children: InlineNode[] };

export type InlineNode =
  | TextNode
  | BoldNode
  | ItalicNode
  | UnderlineNode
  | StrikethroughNode
  | SpoilerNode
  | InlineCodeNode
  | TimestampNode
  | MentionNode
  | EmojiNode;

export type BlockNode =
  | HeadingNode
  | CodeBlockNode
  | BlockquoteNode
  | AlertNode
  | ListNode
  | SubtextNode;

export type AstNode = InlineNode | BlockNode;

// ─── Constants ───────────────────────────────────────────────────

const TIMESTAMP_STYLES: Record<string, string> = {
  R: 'RelativeTime',
  T: 'LongTime',
  t: 'ShortTime',
  d: 'ShortDate',
  D: 'LongDate',
  f: 'ShortDateTime',
  F: 'LongDateTime',
};

const INLINE_MARKERS: readonly { marker: string; type: 'Bold' | 'Underline' | 'Strikethrough' | 'Spoiler' }[] = [
  { marker: '**', type: 'Bold' },
  { marker: '__', type: 'Underline' },
  { marker: '~~', type: 'Strikethrough' },
  { marker: '||', type: 'Spoiler' },
];

// ─── Block-level parser ─────────────────────────────────────────

export function parseMarkdown(content: string): AstNode[] {
  if (!content) return [];

  const nodes: AstNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      nodes.push({
        type: 'CodeBlock',
        content: codeLines.join('\n') + (codeLines.length > 0 ? '\n' : ''),
        ...(language ? { language } : {}),
      });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      nodes.push({
        type: 'Heading',
        level: headingMatch[1].length,
        children: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Blockquote / Alert
    if (line.startsWith('> ') || line === '>') {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        quoteLines.push(lines[i].startsWith('> ') ? lines[i].slice(2) : '');
        i++;
      }
      const quoteContent = quoteLines.join('\n');
      const alertMatch = quoteContent.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)/i,
      );
      if (alertMatch) {
        const raw = alertMatch[1];
        const alertType = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        const body = alertMatch[2].trim();
        nodes.push({
          type: 'Alert',
          alertType,
          children: body ? parseInline(body) : [],
        });
      } else {
        nodes.push({ type: 'Blockquote', children: parseInline(quoteContent) });
      }
      continue;
    }

    // Subtext (must precede unordered list check)
    if (line.startsWith('-# ')) {
      nodes.push({ type: 'Subtext', children: parseInline(line.slice(3)) });
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: ListItemNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push({ children: parseInline(lines[i].slice(2)) });
        i++;
      }
      nodes.push({ type: 'List', ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: ListItemNode[] = [];
      let ordinal = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^\d+\.\s(.+)/);
        items.push({ children: parseInline(m ? m[1] : ''), ordinal });
        ordinal++;
        i++;
      }
      nodes.push({ type: 'List', ordered: true, items });
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular text — accumulate consecutive non-block lines
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      textLines.push(lines[i]);
      i++;
    }
    if (textLines.length > 0) {
      nodes.push(...parseInline(textLines.join('\n')));
    }
  }

  return nodes;
}

function isBlockStart(line: string): boolean {
  if (line.startsWith('```')) return true;
  if (/^#{1,6}\s/.test(line)) return true;
  if (line.startsWith('> ') || line === '>') return true;
  if (line.startsWith('-# ')) return true;
  if (line.startsWith('- ')) return true;
  if (/^\d+\.\s/.test(line)) return true;
  return false;
}

// ─── Inline-level parser ────────────────────────────────────────

export function parseInline(text: string): InlineNode[] {
  if (!text) return [];

  const nodes: InlineNode[] = [];
  let i = 0;
  let buf = '';

  function flush() {
    if (buf) {
      nodes.push({ type: 'Text', content: buf });
      buf = '';
    }
  }

  while (i < text.length) {
    // Inline code — highest priority, no nesting
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i + 1) {
        flush();
        nodes.push({ type: 'InlineCode', content: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Angle-bracket tokens: timestamps and mentions
    if (text[i] === '<') {
      const rest = text.slice(i);

      // Timestamp <t:1234567890:R>
      const tsMatch = rest.match(/^<t:(\d+):([a-zA-Z])>/);
      if (tsMatch) {
        flush();
        nodes.push({
          type: 'Timestamp',
          timestamp: parseInt(tsMatch[1], 10),
          style: TIMESTAMP_STYLES[tsMatch[2]] || 'ShortDateTime',
        });
        i += tsMatch[0].length;
        continue;
      }

      // Role mention <@&id>  (must precede user mention)
      const roleMatch = rest.match(/^<@&(\d+)>/);
      if (roleMatch) {
        flush();
        nodes.push({ type: 'Mention', kind: { kind: 'Role', id: roleMatch[1] } });
        i += roleMatch[0].length;
        continue;
      }

      // User mention <@id>
      const userMatch = rest.match(/^<@(\d+)>/);
      if (userMatch) {
        flush();
        nodes.push({ type: 'Mention', kind: { kind: 'User', id: userMatch[1] } });
        i += userMatch[0].length;
        continue;
      }

      // Channel mention <#id>
      const chanMatch = rest.match(/^<#(\d+)>/);
      if (chanMatch) {
        flush();
        nodes.push({ type: 'Mention', kind: { kind: 'Channel', id: chanMatch[1] } });
        i += chanMatch[0].length;
        continue;
      }

      // Custom emoji <a:name:id>
      const emojiMatch = rest.match(/^<a:(\w+):(\d+)>/);
      if (emojiMatch) {
        flush();
        nodes.push({ type: 'Emoji', kind: { kind: 'Custom', name: emojiMatch[1], id: emojiMatch[2] } });
        i += emojiMatch[0].length;
        continue;
      }
    }

    // Emoji shortcode :name:
    if (text[i] === ':') {
      const end = text.indexOf(':', i + 1);
      if (end > i + 1 && end - i < 40 && !/\s/.test(text.slice(i + 1, end))) {
        const name = text.slice(i + 1, end);

        // Check custom guild emojis
        const customEmojis = useEmojiStore.getState().emojis;
        const custom = Object.values(customEmojis).find(
          (e) => e.name.toLowerCase() === name.toLowerCase(),
        );
        if (custom) {
          flush();
          nodes.push({ type: 'Emoji', kind: { kind: 'Custom', name: custom.name, id: custom.id } });
          i = end + 1;
          continue;
        }

        const surrogates = resolveEmoji(name);
        if (surrogates) {
          flush();
          nodes.push({ type: 'Emoji', kind: { kind: 'Unicode', name, surrogates } });
          i = end + 1;
          continue;
        }
      }
    }

    // Multi-char markers: ** __ ~~ ||
    let matched = false;
    for (const { marker, type } of INLINE_MARKERS) {
      if (text.slice(i, i + marker.length) === marker) {
        const end = text.indexOf(marker, i + marker.length);
        if (end > i + marker.length) {
          flush();
          nodes.push({ type, children: parseInline(text.slice(i + marker.length, end)) } as InlineNode);
          i = end + marker.length;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // Single * for italic (only when next char is not also *)
    if (text[i] === '*' && (i + 1 >= text.length || text[i + 1] !== '*')) {
      const end = text.indexOf('*', i + 1);
      if (end > i + 1) {
        flush();
        nodes.push({ type: 'Italic', children: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    buf += text[i];
    i++;
  }

  flush();
  return nodes;
}

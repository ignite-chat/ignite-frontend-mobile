import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, TextStyles } from '@/theme';
import { CDN_BASE } from '@/utils/cdn';
import { emojiToFilename } from '@/utils/emoji';
import type {
  AstNode,
  EmojiNode,
  InlineNode,
  MentionNode,
  SpoilerNode,
  TimestampNode,
} from '@/utils/markdown-parser';

type ThemeColors = typeof Colors.light;

const ALERT_COLORS: Record<string, string> = {
  Note: '#5865F2',
  Tip: '#57F287',
  Important: '#9B59B6',
  Warning: '#FEE75C',
  Caution: '#ED4245',
};

const HEADING_SIZES = [28, 24, 20, 18, 16, 14];

const BLOCK_TYPES = new Set([
  'Heading',
  'CodeBlock',
  'Blockquote',
  'Alert',
  'List',
  'Subtext',
]);

// ─── Main component ──────────────────────────────────────────────

type Props = { nodes: AstNode[]; colors: ThemeColors; suffix?: React.ReactNode };

export function MarkdownRenderer({ nodes, colors, suffix }: Props) {
  const elements: React.ReactNode[] = [];
  let inlineBuffer: InlineNode[] = [];
  let key = 0;
  let suffixPlaced = false;

  function flushInline(isLast: boolean) {
    if (inlineBuffer.length === 0) return;
    elements.push(
      <Text key={`i${key++}`} style={[TextStyles.body, { color: colors.text }]}>
        {inlineBuffer.map((n, idx) => renderInline(n, idx, colors))}
        {isLast && suffix ? suffix : null}
      </Text>,
    );
    if (isLast && suffix) suffixPlaced = true;
    inlineBuffer = [];
  }

  for (const node of nodes) {
    if (BLOCK_TYPES.has(node.type)) {
      flushInline(false);
      elements.push(renderBlock(node, `b${key++}`, colors));
    } else {
      inlineBuffer.push(node as InlineNode);
    }
  }
  flushInline(true);

  if (suffix && !suffixPlaced) {
    elements.push(
      <Text key={`i${key++}`} style={[TextStyles.body, { color: colors.text }]}>
        {suffix}
      </Text>,
    );
  }

  return <>{elements}</>;
}

// ─── Inline renderer ─────────────────────────────────────────────

function renderInline(
  node: InlineNode,
  key: number | string,
  colors: ThemeColors,
): React.ReactNode {
  switch (node.type) {
    case 'Text':
      return node.content;
    case 'Bold':
      return (
        <Text key={key} style={inlineStyles.bold}>
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );
    case 'Italic':
      return (
        <Text key={key} style={inlineStyles.italic}>
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );
    case 'Underline':
      return (
        <Text key={key} style={inlineStyles.underline}>
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );
    case 'Strikethrough':
      return (
        <Text key={key} style={inlineStyles.strikethrough}>
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );
    case 'InlineCode':
      return (
        <Text
          key={key}
          style={{
            fontFamily: Fonts?.mono ?? 'monospace',
            backgroundColor: colors.surfaceOverlay,
            fontSize: 13,
          }}
        >
          {node.content}
        </Text>
      );
    case 'Emoji':
      return <EmojiInline key={key} node={node} />;
    case 'Mention':
      return <MentionInline key={key} node={node} colors={colors} />;
    case 'Spoiler':
      return <SpoilerInline key={key} node={node} colors={colors} />;
    case 'Timestamp':
      return <TimestampInline key={key} node={node} colors={colors} />;
    default:
      return null;
  }
}

// ─── Emoji ───────────────────────────────────────────────────────

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/';

function EmojiInline({ node }: { node: EmojiNode }) {
  const uri =
    node.kind.kind === 'Custom'
      ? `${CDN_BASE}/emojis/${node.kind.id}`
      : `${TWEMOJI_BASE}${emojiToFilename(node.kind.surrogates)}.svg`;

  return (
    <Image
      source={{ uri }}
      style={inlineStyles.emoji}
      contentFit="contain"
    />
  );
}

// ─── Mention ─────────────────────────────────────────────────────

const MENTION_PREFIX: Record<string, string> = {
  User: '@',
  Channel: '#',
  Role: '@',
};

function MentionInline({ node, colors }: { node: MentionNode; colors: ThemeColors }) {
  const prefix = MENTION_PREFIX[node.kind.kind] ?? '@';
  return (
    <Text style={{ backgroundColor: colors.tint + '30', color: colors.tint }}>
      {prefix}{node.kind.id}
    </Text>
  );
}

// ─── Spoiler ─────────────────────────────────────────────────────

function SpoilerInline({ node, colors }: { node: SpoilerNode; colors: ThemeColors }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Text
      onPress={() => setRevealed((v) => !v)}
      style={{
        backgroundColor: revealed ? colors.surfaceOverlay : colors.textMuted,
        color: revealed ? colors.text : 'transparent',
      }}
    >
      {node.children.map((n, i) => renderInline(n, i, colors))}
    </Text>
  );
}

// ─── Timestamp ───────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const past = diff > 0;

  const s = Math.floor(abs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);

  let value: number;
  let unit: string;
  if (y > 0) {
    value = y;
    unit = 'year';
  } else if (mo > 0) {
    value = mo;
    unit = 'month';
  } else if (d > 0) {
    value = d;
    unit = 'day';
  } else if (h > 0) {
    value = h;
    unit = 'hour';
  } else if (m > 0) {
    value = m;
    unit = 'minute';
  } else {
    value = s;
    unit = 'second';
  }

  const plural = value !== 1 ? 's' : '';
  return past ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
}

function formatTimestamp(ts: number, style: string): string {
  const date = new Date(ts * 1000);
  switch (style) {
    case 'RelativeTime':
      return formatRelativeTime(date);
    case 'LongTime':
      return date.toLocaleTimeString();
    case 'ShortTime':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'ShortDate':
      return date.toLocaleDateString();
    case 'LongDate':
      return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    case 'ShortDateTime':
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'LongDateTime':
      return date.toLocaleString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toLocaleString();
  }
}

function TimestampInline({ node, colors }: { node: TimestampNode; colors: ThemeColors }) {
  return (
    <Text style={{ backgroundColor: colors.surfaceOverlay, color: colors.text }}>
      {formatTimestamp(node.timestamp, node.style)}
    </Text>
  );
}

// ─── Block renderer ──────────────────────────────────────────────

function renderBlock(
  node: AstNode,
  key: string,
  colors: ThemeColors,
): React.ReactNode {
  switch (node.type) {
    case 'Heading': {
      const fontSize = HEADING_SIZES[Math.min(node.level - 1, 5)];
      return (
        <Text
          key={key}
          style={{ fontSize, fontWeight: '700', color: colors.text, marginVertical: 4 }}
        >
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );
    }

    case 'CodeBlock':
      return (
        <View key={key} style={[styles.codeBlock, { backgroundColor: colors.surfaceRaised }]}>
          {node.language ? (
            <Text style={[styles.codeLanguage, { color: colors.textMuted }]}>
              {node.language}
            </Text>
          ) : null}
          <Text
            style={[
              styles.codeText,
              { color: colors.text, fontFamily: Fonts?.mono ?? 'monospace' },
            ]}
          >
            {node.content}
          </Text>
        </View>
      );

    case 'Blockquote':
      return (
        <View key={key} style={[styles.blockquote, { borderLeftColor: colors.textMuted }]}>
          <Text style={[TextStyles.body, { color: colors.text }]}>
            {node.children.map((n, i) => renderInline(n, i, colors))}
          </Text>
        </View>
      );

    case 'Alert': {
      const color = ALERT_COLORS[node.alertType] ?? colors.textMuted;
      return (
        <View key={key} style={[styles.blockquote, { borderLeftColor: color }]}>
          <Text style={{ fontWeight: '600', color, fontSize: 13, marginBottom: 2 }}>
            {node.alertType}
          </Text>
          {node.children.length > 0 && (
            <Text style={[TextStyles.body, { color: colors.text }]}>
              {node.children.map((n, i) => renderInline(n, i, colors))}
            </Text>
          )}
        </View>
      );
    }

    case 'List':
      return (
        <View key={key} style={styles.list}>
          {node.items.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={[TextStyles.body, { color: colors.textMuted, width: 20 }]}>
                {node.ordered ? `${item.ordinal ?? idx + 1}.` : '\u2022'}
              </Text>
              <Text style={[TextStyles.body, { color: colors.text, flex: 1 }]}>
                {item.children.map((n, i) => renderInline(n, i, colors))}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'Subtext':
      return (
        <Text key={key} style={{ fontSize: 12, color: colors.textMuted, lineHeight: 16 }}>
          {node.children.map((n, i) => renderInline(n, i, colors))}
        </Text>
      );

    default:
      return null;
  }
}

// ─── Styles ──────────────────────────────────────────────────────

const inlineStyles = StyleSheet.create({
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  strikethrough: { textDecorationLine: 'line-through' },
  emoji: { width: 22, height: 22, transform: [{ translateY: 6 }] },
});

const styles = StyleSheet.create({
  codeBlock: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  codeLanguage: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginVertical: 4,
  },
  list: {
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    paddingLeft: 8,
    marginVertical: 1,
  },
});

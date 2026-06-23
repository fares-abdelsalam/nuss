import { buildEditorState, defaultRichTextValue } from '@payloadcms/richtext-lexical';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
};

export const extractRichTextPlainText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const walk = (node: RichTextNode | undefined): string => {
    if (!node) {
      return '';
    }

    if (typeof node.text === 'string') {
      return node.text;
    }

    const children = node.children || [];
    const parts = children.map(walk).filter(Boolean);

    if (node.type === 'linebreak') {
      return '\n';
    }

    return parts.join('');
  };

  const root = value as { root?: RichTextNode };
  return walk(root.root).replace(/\n{3,}/g, '\n\n');
};

export const normalizeRichTextValue = (value: unknown): SerializedEditorState => {
  if (value && typeof value === 'object' && 'root' in value) {
    return value as SerializedEditorState;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? buildEditorState({ text: trimmed }) : defaultRichTextValue;
  }

  return defaultRichTextValue;
};

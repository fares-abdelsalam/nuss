'use client';

import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

type RichTextContentProps = {
  value: unknown;
  className?: string;
};

export const RichTextContent = ({ value, className }: RichTextContentProps) => {
  if (typeof value === 'string') {
    return <>{value}</>;
  }

  if (value && typeof value === 'object') {
    return <RichText className={className} data={value as SerializedEditorState} />;
  }

  return null;
};

'use client';

import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import styles from './Text.module.css';

type AllowedTags = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'label';

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: AllowedTags;
  font?: 'ibm-plex' | 'cairo' | 'zarid';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  lineHeight?: string | number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  richTextClassName?: string;
  children: React.ReactNode | SerializedEditorState;
}

const isSerializedEditorState = (value: unknown): value is SerializedEditorState => {
  return !!value && typeof value === 'object' && 'root' in value;
};

const renderChild = (child: React.ReactNode | SerializedEditorState, richTextClassName?: string) => {
  if (isSerializedEditorState(child)) {
    return (
      <div className={`${styles.richText} ${richTextClassName || ''}`}>
        <RichText data={child} />
      </div>
    );
  }

  if (typeof child === 'object' && child !== null && !React.isValidElement(child)) {
    return null;
  }

  return child;
};

export const Text = ({
  as: Tag = 'p',
  font = 'ibm-plex',
  size = 'md',
  weight = 'normal',
  lineHeight,
  color,
  align,
  className = '',
  richTextClassName,
  children,
  style,
  ...restProps
}: TextProps) => {
  const weightClass = typeof weight === 'number' ? `weight-${weight}` : `weight-${weight}`;
  const childArray = Array.isArray(children) ? children : [children];
  const hasRichTextChild = childArray.some((child) => isSerializedEditorState(child));
  const ContentTag = hasRichTextChild && Tag !== 'div' ? 'div' : Tag;
  const content = childArray.length === 1
    ? renderChild(childArray[0], richTextClassName)
    : childArray.map((child, index) => (
        <React.Fragment key={index}>{renderChild(child, richTextClassName)}</React.Fragment>
      ));

  return (
    <ContentTag
      className={`${styles.text} ${styles[`font-${font}`]} ${styles[`size-${size}`]} ${styles[weightClass]} ${align ? styles[`align-${align}`] : ''} ${className}`}
      style={{ color, lineHeight, ...style }}
      {...restProps}
    >
      {content}
    </ContentTag>
  );
};

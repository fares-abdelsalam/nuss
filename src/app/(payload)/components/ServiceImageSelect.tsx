'use client';

import Image from 'next/image';
import React from 'react';
import { useField, useTranslation } from '@payloadcms/ui';
import type { SelectFieldClientComponent } from 'payload';

import { serviceImageOptions } from '../../../content/serviceImages';

export const ServiceImageSelect: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path });
  const { i18n } = useTranslation();
  const currentValue = typeof value === 'string' ? value : '';
  const label = typeof field.label === 'string' 
    ? field.label 
    : (typeof field.label === 'object' && field.label !== null)
      ? field.label[i18n.language] || Object.values(field.label as Record<string, string>)[0]
      : field.name;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{label}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {serviceImageOptions.map((option) => {
          const selected = currentValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue(option.value)}
              style={{
                display: 'grid',
                gap: '0.65rem',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: selected ? '2px solid #111827' : '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 150ms ease',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  minHeight: '110px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%)',
                  borderRadius: '0.5rem',
                }}
              >
                <Image
                  src={option.value}
                  alt={option.label}
                  width={92}
                  height={92}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{option.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

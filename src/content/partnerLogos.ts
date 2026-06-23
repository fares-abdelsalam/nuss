import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type PartnerLogoOption = {
  value: string;
  label: string;
};

/**
 * Scan the public directory for partner-*.svg files at startup
 * and expose them as selectable options in the CMS.
 */
const scanPartnerLogos = (): PartnerLogoOption[] => {
  try {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.resolve(dirname, '../../public');
    const files = fs.readdirSync(publicDir);

    return files
      .filter((f) => /^partner-\d+\.\w+$/i.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      })
      .map((f) => ({
        value: `/${f}`,
        label: f.replace(/\.\w+$/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }));
  } catch {
    // Fallback for environments where the public dir may not exist
    return Array.from({ length: 25 }, (_, i) => ({
      value: `/partner-${i + 1}.svg`,
      label: `Partner ${i + 1}`,
    }));
  }
};

export const partnerLogoOptions: PartnerLogoOption[] = scanPartnerLogos();

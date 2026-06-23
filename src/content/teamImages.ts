import fs from 'node:fs';
import path from 'node:path';

export type TeamImageOption = {
  value: string;
  label: string;
};

const scanTeamImages = (pattern: RegExp): TeamImageOption[] => {
  try {
    const publicDir = path.resolve(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);

    return files
      .filter((f) => pattern.test(f))
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
    // Fallback if directory scanning fails
    if (pattern.source.includes('manager')) {
      return Array.from({ length: 6 }, (_, i) => ({
        value: `/team-manager-${i + 1}.webp`,
        label: `Team Manager ${i + 1}`,
      }));
    } else {
      return Array.from({ length: 51 }, (_, i) => ({
        value: `/team-${i + 1}.webp`,
        label: `Team ${i + 1}`,
      }));
    }
  }
};

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const formatImageLabel = (fileName: string): string => (
  fileName
    .replace(/\.\w+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
);

const scanImageFolder = (folderFromPublic: string): TeamImageOption[] => {
  try {
    const publicDir = path.resolve(process.cwd(), 'public');
    const imageDir = path.join(publicDir, folderFromPublic);
    const files = fs.readdirSync(imageDir);

    return files
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({
        value: `/${folderFromPublic.replace(/\\/g, '/')}/${file}`,
        label: formatImageLabel(file),
      }));
  } catch {
    return [];
  }
};

export const managerImageOptions: TeamImageOption[] = scanTeamImages(/^team-manager-\d+\.\w+$/i);
export const memberImageOptions: TeamImageOption[] = scanImageFolder('team/members');

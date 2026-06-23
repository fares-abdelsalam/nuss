'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react';

const collectionToSectionId: Record<string, string> = {
  // Collections
  'services': 'services',
  'business-models': 'business',
  'journey-section': 'journey',
  'journeys': 'journey',
  'methodology-section': 'methodology',
  'partners-section': 'partners',
  'portfolio-section': 'portfolio',
  // Translation Collections (Globals)
  'navbar': 'hero', // Navbar is at the top
  'hero': 'hero',
  'vision_section': 'vision',
  'journey_section': 'journey',
  'services_section': 'services',
  'methodology_section': 'methodology',
  'team_section': 'team',
  'team-section': 'team',
  'business_models_section': 'business',
  'footer-data': 'footer',
};

export const RefreshRouteOnSave = ({ serverURL }: { serverURL: string }) => {
  const router = useRouter();
  const lastSlug = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'payload-live-preview') {
        const slug = event.data.collection || event.data.global;

        if (slug && slug !== lastSlug.current && collectionToSectionId[slug]) {
          lastSlug.current = slug;
          const sectionId = collectionToSectionId[slug];
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <PayloadRefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
};
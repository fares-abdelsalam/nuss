'use client';

import React from 'react';
import styles from './MethodologySection.module.css';
import { Text } from '@/components/Text';
import { RichTextContent } from '@/components/RichTextContent';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import type { MethodologySectionData, MethodologyCard } from '@/i18n/getMethodologySection';

type MethodologySectionProps = {
  payloadData?: MethodologySectionData;
};

export const MethodologySection = ({ payloadData }: MethodologySectionProps) => {
  const isMobile = useIsMobile();
  const { t, tPlain, locale } = useTranslation();

  const payloadCards = payloadData?.cards || [];

  const defaultCards: MethodologyCard[] = [
    { id: '1', title: tPlain('methodologySection', 'cards.discovery.title'), description: tPlain('methodologySection', 'cards.discovery.desc'), color: '#FF279E', iconType: 'default', iconName: 'approach-1' },
    { id: '2', title: tPlain('methodologySection', 'cards.strategy.title'), description: tPlain('methodologySection', 'cards.strategy.desc'), color: '#777DFB', iconType: 'default', iconName: 'approach-2' },
    { id: '3', title: tPlain('methodologySection', 'cards.execution.title'), description: tPlain('methodologySection', 'cards.execution.desc'), color: '#FF9400', iconType: 'default', iconName: 'approach-3' },
    { id: '4', title: tPlain('methodologySection', 'cards.analysis.title'), description: tPlain('methodologySection', 'cards.analysis.desc'), color: '#65F0E9', iconType: 'default', iconName: 'approach-4' },
    { id: '5', title: tPlain('methodologySection', 'cards.innovation.title'), description: tPlain('methodologySection', 'cards.innovation.desc'), color: '#FF279E', iconType: 'default', iconName: 'approach-5' },
    { id: '6', title: tPlain('methodologySection', 'cards.delivery.title'), description: tPlain('methodologySection', 'cards.delivery.desc'), color: '#777DFB', iconType: 'default', iconName: 'approach-6' },
  ];

  const activeCards = payloadCards.length > 0
    ? payloadCards.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      color: c.color,
      iconType: c.iconType,
      iconName: c.iconName,
      customIconUrl: c.customIconUrl
    }))
    : defaultCards;

  return (
    <section className={styles.section}>
      {isMobile ?
        <>
          <div className={styles.overlay}></div>
          <div className={styles.overlay2}></div>
        </>
        :
        <div className={styles.videoBackground}>
          {/* Placeholder for video */}
          <video autoPlay loop muted playsInline className={styles.video}>
            <source src="/methodology-video.mp4" type="video/mp4" />
          </video>
          <div className={styles.overlay}></div>
          <div className={styles.overlay2}></div>
          <div className={styles.gridOverlay}></div>
        </div>
      }

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          {isMobile ?
          <div className={styles.iconCircle}>
            {/* Use apostrophe.svg */}
            <img
              src="/apostrophe.svg"
              alt="Apostrophe Icon"
              className={styles.iconSvg}
            />
          </div>
          : <></>
          }
          <Text as="h2" font="zarid" size={isMobile ? "4xl" : "7xl"} weight={700} color="#ffffff" className={styles.mainTitle}>
            {payloadData?.title ? (
              <RichTextContent value={payloadData.title} />
            ) : (
              t('methodologySection', 'title')
            )}
          </Text>
        </div>

        <div className={styles.cardsGrid}>
          {activeCards.map((card, i) => {
            const iconPath = card.iconType === 'custom' && card.customIconUrl
              ? card.customIconUrl
              : `/${card.iconName || `approach-${i + 1}`}.svg`;

            return (
              <div key={card.id} className={styles.card}>
                <div className={styles.cardNumber}>{(i + 1).toString()}</div>

                <div className={styles.cardContent}>
                  <div className={styles.cardIcon}>
                    <div className={styles.iconPlaceholder}>
                      <img src={iconPath} alt="" className={styles.iconImage} />
                    </div>
                  </div>

                  <Text as="div" font="zarid" size={isMobile ? "lg" : "2xl"} weight={800} color="#ffffff" className={styles.cardTitle}>
                    <RichTextContent value={card.title} />
                  </Text>
                  <Text as="div" font="zarid" size={isMobile ? "sm" : "md"} color="#dddddd" weight={600} className={styles.cardDesc}>
                    <RichTextContent value={card.description} />
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

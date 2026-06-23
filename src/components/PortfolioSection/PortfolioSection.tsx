'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Text } from '@/components/Text';
import styles from './PortfolioSection.module.css';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import { RichTextContent } from '@/components/RichTextContent';
import type { PortfolioSectionData, PortfolioTab } from '@/i18n/getPortfolioSection';

type Props = {
  portfolioData?: PortfolioSectionData;
};

export const PortfolioSection = ({ portfolioData }: Props) => {
  const { t, tPlain, locale, getValue } = useTranslation();
  const isLTR = locale === 'en';
  const isMobile = useIsMobile();

  // ── Build tab list ──
  // Prefer CMS data; fall back to hardcoded i18n tabs when CMS is empty
  const cmsTabs = portfolioData?.tabs ?? [];
  const hasCmsData = cmsTabs.length > 0 && cmsTabs.some((tab) => tab.entries.length > 0);

  const fallbackTabs: PortfolioTab[] = [
    {
      tabId: 'gov',
      tabLabel: tPlain('portfolioSection', 'tabs.gov'),
      entries: [
        {
          title: tPlain('portfolioSection', 'works.gov.client1'),
          logoUrl: '/culture-logo.svg',
          mainMediaUrl: '/culture-image.jpg',
          mainMediaType: 'image',
        },
        {
          title: tPlain('portfolioSection', 'works.gov.client2'),
          logoUrl: '/private-logo.webp',
          mainMediaUrl: '/private-image.jpg',
          mainMediaType: 'image',
        },
      ],
    },
    {
      tabId: 'private',
      tabLabel: tPlain('portfolioSection', 'tabs.private'),
      entries: [
        {
          title: tPlain('portfolioSection', 'works.private.client1'),
          logoUrl: '/private-logo.webp',
          mainMediaUrl: '/private-image.jpg',
          mainMediaType: 'image',
        },
        {
          title: tPlain('portfolioSection', 'works.private.client2'),
          logoUrl: '/private-logo.webp',
          mainMediaUrl: '/private-image.jpg',
          mainMediaType: 'image',
        },
      ],
    },
    {
      tabId: 'nonProfit',
      tabLabel: tPlain('portfolioSection', 'tabs.nonProfit'),
      entries: [
        {
          title: tPlain('portfolioSection', 'works.nonProfit.client1'),
          logoUrl: '/nonprofit-logo.svg',
          mainMediaUrl: '/nonprofit-video.mp4',
          mainMediaType: 'video',
        },
        {
          title: tPlain('portfolioSection', 'works.nonProfit.client2'),
          logoUrl: '/nonprofit-logo.svg',
          mainMediaUrl: '/nonprofit-video.mp4',
          mainMediaType: 'video',
        },
      ],
    },
    {
      tabId: 'nuss',
      tabLabel: tPlain('portfolioSection', 'tabs.nuss'),
      entries: [
        {
          title: tPlain('portfolioSection', 'works.nuss.client1'),
          logoUrl: '/nuss-logo-placeholder.png',
          mainMediaUrl: '/nuss-initiatives-placeholder.png',
          mainMediaType: 'image',
        },
        {
          title: tPlain('portfolioSection', 'works.nuss.client2'),
          logoUrl: '/nuss-logo-placeholder.png',
          mainMediaUrl: '/nuss-initiatives-placeholder.png',
          mainMediaType: 'image',
        },
      ],
    },
  ];

  const tabs = hasCmsData ? cmsTabs : fallbackTabs;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const activeTab = tabs[activeTabIndex] ?? tabs[0];
  const activeEntries = activeTab?.entries ?? [];
  const currentItem = activeEntries[carouselIndex];
  const hasMultipleItems = activeEntries.length > 1;

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    setCarouselIndex(0);
  };

  const nextCarouselItem = () => {
    setCarouselIndex((prev) =>
      prev < activeEntries.length - 1 ? prev + 1 : 0,
    );
  };

  const prevCarouselItem = () => {
    setCarouselIndex((prev) =>
      prev > 0 ? prev - 1 : activeEntries.length - 1,
    );
  };

  const cmsTitle = portfolioData?.title;
  const cmsDesc = portfolioData?.description;
  const description = cmsDesc || getValue('portfolioSection', 'description');

  const isVideo = (url: string, mediaType?: string) =>
    mediaType === 'video' || url.endsWith('.mp4') || url.endsWith('.webm');

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.rightContent}>
          {/* Top Nuss Logo */}
          <div className={styles.nussIcon}>
            <Image src="/nuss-icon.svg" alt="Nuss Icon" width={isMobile ? 80 : 60} height={isMobile ? 80 : 60} style={{ filter: 'invert(1)' }} />
          </div>

          <div className={styles.titleWrapper}>
            <div className={styles.cmsTitle}>
              <Text as="div" font="zarid" size={isMobile ? '4xl' : '7xl'} color="#ffffff" align={isMobile ? 'center' : isLTR ? "left" : "right"} weight={isMobile ? "medium" : "bold"} lineHeight={1.2}>
                <RichTextContent value={cmsTitle} />
              </Text>
            </div>
          </div>
        </div>

        <div className={styles.leftContent}>
          <div className={styles.descriptionWrapper}>
            <Text as="div" font="zarid" size={isMobile ? 'md' : '2xl'} color="#CFCFCF" align={isLTR ? "left" : "right"} weight="normal" lineHeight={1.5} className={styles.descriptionText}>
              <RichTextContent
                value={description}
              />
            </Text>
          </div>


        </div>
      </div>

      <div className={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <button
            key={tab.tabId}
            onClick={() => handleTabChange(index)}
            className={`${styles.tab} ${activeTabIndex === index ? styles.activeTab : ''}`}
          >
            <Text font="zarid" size={isMobile ? 'md' : 'lg'}  color={activeTabIndex === index ? '#ffffff' : '#888888'} align="center">
              {tab.tabLabel}
            </Text>
            {activeTabIndex === index && (
              <motion.div
                layoutId="activeTabIndicator"
                className={styles.activeIndicator}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mobile layout */}
      {currentItem && (
        <div className={styles.mobileContentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab.tabId}-mobile-${carouselIndex}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={styles.mobileContentInner}
            >
              {/* Row for logo and description */}
              <div className={styles.mobileInfoRow}>
                {currentItem.logoUrl && (
                  <div className={styles.mobileLogo}>
                    <img
                      src={currentItem.logoUrl}
                      alt={`${currentItem.title} logo`}
                      className={styles.logoImage}
                    />
                  </div>
                )}

                <div className={styles.mobileDescription}>
                  <Text font="zarid" size="lg" color="#CFCFCF" align={isLTR ? "left" : "right"} weight="normal">
                    {currentItem.title}
                  </Text>
                </div>
              </div>

              <div className={styles.mobileMediaContainer}>
                {isVideo(currentItem.mainMediaUrl, currentItem.mainMediaType) ? (
                  <video
                    src={currentItem.mainMediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.contentVideo}
                  />
                ) : (
                  <div className={styles.imageWrapper}>
                    <img
                      src={currentItem.mainMediaUrl}
                      alt={`${currentItem.title} work`}
                      className={styles.contentImage}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {hasMultipleItems && (
            <div className={styles.mobileNavigation}>
              <button
                onClick={nextCarouselItem}
                className={`${styles.mobileNavButton} ${carouselIndex === activeEntries.length - 1 ? styles.disabled : ''}`}
                disabled={carouselIndex === activeEntries.length - 1}
                aria-label={tPlain('portfolioSection', 'navNext')}
              >
                <Image src="/arrow.svg" alt="" width={24} height={24} className={styles.navIcon} />
              </button>
              <button
                onClick={prevCarouselItem}
                className={`${styles.mobileNavButton} ${carouselIndex === 0 ? styles.disabled : ''}`}
                disabled={carouselIndex === 0}
                aria-label={tPlain('portfolioSection', 'navPrev')}
              >
                <Image src="/arrow.svg" alt="" width={24} height={24} className={styles.navIcon} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop content */}
      {currentItem && (
        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab.tabId}-text-${carouselIndex}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className={styles.contentRight}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Text font="zarid" size="2xl" color="#CFCFCF" align={isLTR ? "left" : "right"} weight="normal">
                  {currentItem.title}
                </Text>
              </div>

              <div className={styles.clientLogoWrapper}>
                {currentItem.logoUrl && (
                  <div className={styles.clientLogo}>
                    <img
                      src={currentItem.logoUrl}
                      alt={`${currentItem.title} logo`}
                      className={styles.logoImage}
                    />
                  </div>
                )}

                {hasMultipleItems && (
                  <div className={styles.navigation}>
                    <button
                      onClick={nextCarouselItem}
                      className={`${styles.navButton} ${carouselIndex === activeEntries.length - 1 ? styles.disabled : ''}`}
                      disabled={carouselIndex === activeEntries.length - 1}
                      aria-label={tPlain('portfolioSection', 'navNext')}
                    >
                      <Image src="/arrow.svg" alt="" width={32} height={32} className={styles.navIcon} />
                    </button>
                    <button
                      onClick={prevCarouselItem}
                      className={`${styles.navButton} ${carouselIndex === 0 ? styles.disabled : ''}`}
                      disabled={carouselIndex === 0}
                      aria-label={tPlain('portfolioSection', 'navPrev')}
                    >
                      <Image src="/arrow.svg" alt="" width={32} height={32} className={styles.navIcon} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab.tabId}-${carouselIndex}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={styles.contentLeft}
            >
              <div className={styles.mediaContainer}>
                {isVideo(currentItem.mainMediaUrl, currentItem.mainMediaType) ? (
                  <video
                    src={currentItem.mainMediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.contentVideo}
                  />
                ) : (
                  <div className={styles.imageWrapper}>
                    <img
                      src={currentItem.mainMediaUrl}
                      alt={`${currentItem.title} work`}
                      className={styles.contentImage}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

    </section>
  );
};

'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Text } from '@/components/Text';
import { RichTextContent } from '@/components/RichTextContent';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import { CountUp } from '@/components/CountUp';
import type { JourneySectionData, JourneyStat } from '@/i18n/getJourneySection';
import styles from './JourneySection.module.css';

type JourneyItem = {
  id: string;
  year: string;
  title: unknown;
  description: unknown;
};

type JourneySectionProps = {
  sectionTitle: unknown;
  introTitle: unknown;
  introDescription: unknown;
  journeys: JourneyItem[];
  stats: JourneyStat[];
};

const rotationVariants = {
  enter: (custom: { direction: number, isLTR: boolean }) => ({
    rotate: custom.direction > 0 ? (custom.isLTR ? -90 : 90) : (custom.isLTR ? 90 : -90),
  }),
  center: {
    rotate: 0,
  },
  exit: (custom: { direction: number, isLTR: boolean }) => ({
    rotate: custom.direction > 0 ? (custom.isLTR ? 90 : -90) : (custom.isLTR ? -90 : 90),
  })
};

export const JourneySection = ({ sectionTitle, introTitle, introDescription, journeys, stats }: JourneySectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isMobile = useIsMobile();
  const { t, tPlain, locale } = useTranslation();
  const isLTR = locale === 'en';
  const fallbackJourneys: JourneyItem[] = [
    {
      id: 'fallback-2014',
      year: '2014',
      title: tPlain('journeySection', 'title2014'),
      description: tPlain('journeySection', 'desc2014'),
    },
    {
      id: 'fallback-2018',
      year: '2018',
      title: tPlain('journeySection', 'title2018'),
      description: tPlain('journeySection', 'desc2018'),
    },
    {
      id: 'fallback-2023',
      year: '2023',
      title: tPlain('journeySection', 'title2023'),
      description: tPlain('journeySection', 'desc2023'),
    },
  ];
  const journeyItems = journeys.length > 0 ? journeys : fallbackJourneys;
  const activeJourney = journeyItems[activeIndex] ?? journeyItems[0];
  const itemCount = journeyItems.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  useEffect(() => {
    if (!journeyItems.length) {
      return undefined;
    }

    return scrollYProgress.on("change", (latest) => {
      const items = journeyItems.length;
      // Map 0-1 to 0-(items-1)
      // We want the last item to stay visible for a bit at the end
      // So we divide by items, but make sure the last segment covers the end
      const segment = 1 / items;
      const index = Math.min(
        Math.floor(latest / segment),
        items - 1
      );

      setActiveIndex(prev => {
        if (index !== prev) {
          setDirection(index > prev ? 1 : -1);
        }
        return index;
      });
    });
  }, [scrollYProgress, journeyItems.length]);

  if (isMobile) {
    return (
      <div className={styles.mobileJourneySection} ref={containerRef} style={{ height: `${(itemCount + 1) * 60}vh` }}>
        <div className={styles.mobileStickyWrapper}>
          {/* Background Layers for Mobile */}
          <div className={styles.bgGrid}></div>
          <div className={styles.bgTexture}></div>

          {/* Apostrophe Icon & Header (Section Title) */}
          <div className={styles.mobileTopRow}>
            <div className={styles.mobileIconCircle}>
              <img src="/apostrophe.svg" alt="Apostrophe Icon" className={styles.mobileIconSvg} />
            </div>
            <div className={styles.mobileHeaderTitle}>
              <Text font="zarid" size="4xl" weight="bold" color="#000">
                <RichTextContent value={sectionTitle} />
              </Text>
            </div>
          </div>

          {/* Animated Journey Item */}
          <div className={styles.mobileAnimatedArea}>
            <AnimatePresence custom={{ direction, isLTR }}>
              <motion.div
                key={activeIndex}
                custom={{ direction, isLTR }}
                variants={rotationVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={styles.mobileTextWrapper}
                style={{ transformOrigin: isLTR ? "150% center" : "-50% center" }}
                transition={{
                  type: "spring",
                  stiffness: 40,
                  damping: 10,
                  mass: 1.5,
                  restDelta: 0.001
                }}
              >
                <Text as="div" font="zarid" size="2xl" weight="bold" color='#000' className={styles.mobileTitleWrapper}>
                  {activeJourney.year} <RichTextContent className={styles.inlineRichText} value={activeJourney.title} />
                </Text>
                <div className={styles.mobileDescription}>
                  <Text font="zarid" size="lg" weight={400} color="#000" style={{ lineHeight: '1.4' }}>
                    <RichTextContent value={activeJourney.description} />
                  </Text>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Intro Block (Visible at the end or always? Match desktop: always at bottom part) */}
          <div className={styles.mobileIntroBlock}>
            <Text as="div" font="zarid" size="4xl" weight="bold" color="#1E1E1E" align="center">
              <RichTextContent value={introTitle} />
            </Text>
            <Text as="div" font="zarid" size="md" color="#1E1E1E" align="center" style={{ lineHeight: '1.6' }}>
              <RichTextContent value={introDescription} />
            </Text>
          </div>

          {/* Stats */}
          <div className={styles.mobileStats}>
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.mobileStatItem}>
                <Text font="zarid" size="4xl" weight="bold" color="#1E1E1E" style={{ letterSpacing: '-0.04em' }}>
                  <CountUp
                    to={stat.number}
                    prefix={stat.prefix || ''}
                    suffix={stat.suffix || ''}
                  />
                </Text>
                <Text
                  font="zarid"
                  size="xs"
                  weight="light"
                  align="center"
                  color="#1E1E1E"
                  style={{ marginTop: '-1em' }}
                >
                  <RichTextContent value={stat.label} />
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.journeySection} ref={containerRef} style={{ height: `${(itemCount + 1) * 45}vh` }}>
      <div className={styles.stickyWrapper}>

        {/* Background Layers */}
        <div className={styles.bgGrid}></div>
        <div className={styles.bgTexture}></div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>



          {/* Main Content (Title, Icon, Description) */}
          <div className={styles.mainContent}>

            {/* Right Side: Icon (Visible Left in LTR layout, but Right logic effectively if RTL flex) */}
            {/* Wait, design has Icon on Left and Text on Right. With RTL, 'Left' is end, 'Right' is start. */}
            {/* Let's follow visual "Left" = Icon, "Right" = Text regardless of RTL */}
            {/* In RTL, the first child is on the Right. So if I want Icon on LEFT, it should be the SECOND child. */}

            {/* First Child: Text Content (Right) */}
            <div className={styles.rightSide}>
              <AnimatePresence custom={{ direction, isLTR }}>
                <motion.div
                  key={activeIndex}
                  custom={{ direction, isLTR }}
                  variants={rotationVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={styles.textWrapper}
                  style={{ transformOrigin: isLTR ? "220% center" : "-120% center" }}
                  transition={{
                    type: "spring",
                    stiffness: 40,
                    damping: 10,
                    mass: 1.5,
                    restDelta: 0.001
                  }}
                >
                  <Text as="div" font="zarid" size="2xl" weight="bold" color='#000' className={styles.titleWrapper}>
                    {activeJourney.year} <RichTextContent className={styles.inlineRichText} value={activeJourney.title} />
                  </Text>
                  <div className={styles.description}>
                    <Text font="zarid" size="xl" weight={400} color="#000" style={{ lineHeight: '1.2' }}>
                      <RichTextContent value={activeJourney.description} />
                    </Text>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Second Child: Icon (Left) */}
            {/* Header */}
            <div className={styles.leftSide}>
              <div className={styles.header}>
                <div className={styles.headerTitle}>
                  <Text font="zarid" size="7xl" weight="bold" color="#000">
                    <RichTextContent value={sectionTitle} />
                  </Text>
                  {/* <div className={styles.headerUnderline}></div> */}
                </div>
              </div>
              <div className={styles.iconCircle}>
                {/* Use apostrophe.svg */}
                <img
                  src="/apostrophe.svg"
                  alt="Apostrophe Icon"
                  className={styles.iconSvg}
                />
              </div>



            </div>


          </div>

        </div>

        <div className={styles.introBlock}>
          <Text as="div" font="zarid" size="4xl" weight="bold" color="#1E1E1E" align="center">
            <RichTextContent value={introTitle} />
          </Text>
          <Text as="div" font="zarid" size="2xl" weight="light" color="#1E1E1E" align="center" lineHeight={1.2} style={{ maxWidth: '32rem' }}>
            <RichTextContent value={introDescription} />
          </Text>
        </div>

        {/* Footer Stats */}
        <div className={styles.footer}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statItem}>
              <Text font="zarid" size="6xl" weight="bold" color="#1E1E1E" style={{ letterSpacing: '-0.04em', fontSize: '64px', lineHeight: '100%' }}>
                <CountUp
                  to={stat.number}
                  prefix={stat.prefix || ''}
                  suffix={stat.suffix || ''}
                />
              </Text>
              <Text
                font="zarid"
                size="sm"
                weight='light'
                color="#1E1E1E"
                style={{
                  marginRight: locale === 'ar' ? '80px' : '0',
                  marginLeft: locale === 'en' ? '80px' : '0'
                }}
              >
                <RichTextContent value={stat.label} />
              </Text>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

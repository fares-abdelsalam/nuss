'use client';

import { useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Text } from '@/components/Text';
import { InteractiveButton } from '@/components/InteractiveButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import styles from './HeroSection.module.css';

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { t, locale } = useTranslation();
  const isLTR = locale === 'en';
  const [isExiting, setIsExiting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [heroRect, setHeroRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);

  const handleTransition = () => {
    const node = document.querySelector(`.${styles.heroSection}`);
    if (node) {
      const rect = node.getBoundingClientRect();
      setHeroRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
    setIsExiting(true);
  };

  const handleExitComplete = () => {
    if (isExiting) {
      setIsRestoring(true);
      setResetKey(prev => prev + 1);
      setIsExiting(false);
    }
  };

  useLayoutEffect(() => {
    if (isExiting) {
      const nav = document.querySelector('nav');
      if (nav) {
        const navHeight = nav.getBoundingClientRect().height;
        // Shift window down by Navbar height so the Vision section slides perfectly under it
        window.scrollTo({ top: navHeight, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [isExiting]);

  // useLayoutEffect perfectly prevents any visual flicker when popping 
  // the Hero section back into the DOM above the current view.
  useLayoutEffect(() => {
    if (isRestoring) {
      const visionSection = document.getElementById('vision-section');
      if (visionSection) {
        // Return to the exact offset logic you wanted, letting the Navbar overlap naturally.
        window.scrollTo({ top: visionSection.offsetTop, left: 0, behavior: 'instant' as ScrollBehavior });
      }
      setTimeout(() => setIsRestoring(false), 0);
    }
  }, [isRestoring]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!isExiting && (
        <motion.div
          key={`hero-motion-node-${resetKey}`}
          className={styles.heroSection}
          initial={{ opacity: 1, position: 'relative' }}
          animate={{ opacity: 1, position: 'relative' }}
          exit={{
            opacity: 0,
            position: 'fixed',
            top: heroRect?.top || 0,
            left: heroRect?.left || 0,
            width: heroRect?.width || '100%',
            height: heroRect?.height || 'auto'
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{
            overflow: 'hidden',
            backgroundColor: '#FBF5F3',
            zIndex: 40
          }}
        >
          <div className={styles.textureOverlay}></div>
          <div className={styles.gridOverlay}></div>

          <div className={styles.content}>
            <div className={styles.titleContainer}>
              <div className={styles.titleLine1Container}>
                {!isLTR && <img src="/apostrophe.svg" alt="" className={styles.apostrophe} />}
                <Text font="zarid" size={isMobile ? "xl" : "7xl"} weight="semibold" className={styles.titleLine1} lineHeight={isMobile ? isLTR ? 1 : 0.5 : isLTR ? 0.75 : 1} color='#1E1E1E'>
                  {t('hero', 'titleLine1')}
                </Text>
              </div>
              {/* <Text font="zarid" size="4xl" weight="bold" align={isMobile ? 'center' : 'right'} className={styles.titleLine2} color='#454545'>
                {t('hero', 'titleLine2')}
              </Text> */}
            </div>

            <div className={styles.descriptionContainer}>
              <Text font="zarid" size="5xl" color="#6A6A6B" align="center" weight={200} lineHeight="1.1" className={styles.description}>
                {t('hero', 'description')}
              </Text>
            </div>

            {!isMobile && (
              <div className={styles.buttonPosition}>
                <InteractiveButton onClick={handleTransition} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Text } from '@/components/Text';
import { useTranslation } from '@/i18n/LocaleContext';
import styles from './BusinessModelsSection.module.css';
import { useIsMobile } from '@/hooks/useIsMobile';

type BusinessModelItem = {
  id: string;
  key: string;
  title: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  url: string;
};

export const BusinessModelsSection = ({ businessModels }: { businessModels: BusinessModelItem[] }) => {
  const { t, locale } = useTranslation();
  const isLTR = locale === 'en';
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const hasBusinessModels = businessModels.length > 0;

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const card = scrollRef.current.children[index] as HTMLElement;

      if (card) {
        isScrolling.current = true;
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    }
  };

  const getClosestIndex = useCallback(() => {
    if (!scrollRef.current) return 0;

    const container = scrollRef.current;
    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const distance = Math.abs(childCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const handleNext = () => {
    const baseIndex = getClosestIndex();

    if (baseIndex < businessModels.length - 1) {
      const nextIndex = baseIndex + 1;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    const baseIndex = getClosestIndex();

    if (baseIndex > 0) {
      const prevIndex = baseIndex - 1;
      setCurrentIndex(prevIndex);
      scrollToIndex(prevIndex);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || isScrolling.current) return;
    const closestIndex = getClosestIndex();

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Text font="zarid" size={isMobile ? '4xl' : '7xl'} color="#000" align={isLTR ? 'left' : 'right'} weight="bold" className={styles.titleTop} lineHeight={0.8}>
            {t('businessModelsSection', 'title')}
          </Text>
          {/* <div style={{ width: '150px', height: '4px', backgroundColor: '#333', marginTop: '10px', alignSelf: 'flex-end' }} /> */}
        </div>
      </div>

      <div
        className={styles.grid}
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ direction: isLTR ? 'ltr' : 'rtl' }}
      >
        {businessModels.map((model, index) => (
          <motion.div
            key={model.id}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{
              opacity: { duration: 0.5, delay: index * 0.1 },
              y: { duration: 0.5, delay: index * 0.1 },
              scale: { duration: 0.3, ease: "easeOut" }
            }}
            onClick={() => {
              if (model.url) {
                const url = model.url.match(/^https?:\/\//) ? model.url : `https://${model.url}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
            style={{ cursor: model.url ? 'pointer' : undefined }}
          >
            {model.mediaUrl ? (
              model.mediaType === 'video' ? (
                <video src={model.mediaUrl} autoPlay loop muted playsInline className={styles.media} />
              ) : (
                <img src={model.mediaUrl} alt={model.title} className={styles.media} />
              )
            ) : null}

            <div className={styles.cardContent}>
              <div className={styles.cardTitleWrapper}>
                <Text font="zarid" size={isMobile ? '5xl' : '7xl'} color="#ffffff" align={isLTR ? 'left' : 'right'} weight="bold" style={{ lineHeight: '0.9' }}>
                  {model.title}
                </Text>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.navigation} style={{ flexDirection: isLTR ? 'row' : 'row' }}>
        <button
          onClick={handlePrev}
          className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
          disabled={!hasBusinessModels || currentIndex === 0}
          aria-label={locale === 'en' ? 'Previous business model' : 'النموذج السابق'}
        >
          <Image
            src="/arrow.svg"
            alt=""
            width={32}
            height={32}
            className={styles.navIcon}
            style={{ transform: isLTR ? 'rotate(0deg)' : 'rotate(180deg)', filter: 'invert(1)' }}
          />
        </button>
        <button
          onClick={handleNext}
          className={`${styles.navButton} ${currentIndex === businessModels.length - 1 ? styles.disabled : ''}`}
          disabled={!hasBusinessModels || currentIndex === businessModels.length - 1}
          aria-label={locale === 'en' ? 'Next business model' : 'النموذج التالي'}
        >
          <Image
            src="/arrow.svg"
            alt=""
            width={32}
            height={32}
            className={styles.navIcon}
            style={{ transform: isLTR ? 'rotate(180deg)' : 'rotate(0deg)', filter: 'invert(1)' }}
          />
        </button>
      </div>
    </section>
  );
};

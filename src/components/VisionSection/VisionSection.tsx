'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Text } from '@/components/Text';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import styles from './VisionSection.module.css';
import { InteractiveButton } from '@/components/InteractiveButton';

const PARTNERS = [
  { name: 'Partner 1', src: '/partner-1.svg' },
  { name: 'Partner 2', src: '/partner-2.svg' },
  { name: 'Partner 3', src: '/partner-3.svg' },
  { name: 'Partner 4', src: '/partner-4.svg' },
  { name: 'Partner 5', src: '/partner-5.svg' },
  { name: 'Partner 6', src: '/partner-6.svg' },
  { name: 'Partner 7', src: '/partner-7.svg' },
  { name: 'Partner 8', src: '/partner-8.svg' },
  { name: 'Partner 9', src: '/partner-9.svg' },
  { name: 'Partner 10', src: '/partner-10.svg' },
  { name: 'Partner 11', src: '/partner-11.svg' },
];

const VISION_MEDIA = [
  { type: 'video', src: '/vision-1.mp4' }, // Scaled up to hide baked-in black bars
  { type: 'image', src: '/vision-2.png' },
  { type: 'video', src: '/vision-3.mp4' },
  { type: 'video', src: '/vision-4.mp4', scale: 1.8 },
];

import type { Partner } from '@/i18n/getPartnersSection';
import { Bold } from 'lucide-react';

interface VisionSectionProps {
  partners?: Partner[];
}

export const VisionSection = ({ partners: cmsPartners }: VisionSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const { t, tPlain } = useTranslation();

  const partners = cmsPartners && cmsPartners.length > 0 ? cmsPartners : PARTNERS.map((p, i) => ({ id: String(i), name: p.name, logo: p.src }));

  const VISION_CONTENT = [
    {
      title: t('visionSection', 'visionTitle'),
      description: t('visionSection', 'visionDesc')
    },
    // {
    //   title: t('visionSection', 'missionTitle'),
    //   description: t('visionSection', 'missionDesc')
    // }
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const handleScrollClick = () => {
    const journeySection = document.getElementById('journey');
    if (!journeySection) return;

    journeySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const items = VISION_CONTENT.length;
      const segment = 1 / items;
      const index = Math.min(Math.floor(latest / segment), items - 1);
      setActiveIndex(index);
    });
  }, [scrollYProgress, VISION_CONTENT.length]);

  if (isMobile) {
    return (
      <div id="vision-section" className={styles.mobileVisionSection}>

        {/* Top: Vision Content */}
        <div className={styles.mobileTextBlock}>
          <Text font="zarid" size="4xl" weight="bold" color="#fff" align="center" className={styles.mobileTitle}>
            {VISION_CONTENT[0].title}
          </Text>
          <Text font="zarid" size="lg" color="#B0AEAE" align="center" richTextClassName={styles.mobileDescription}>
            {VISION_CONTENT[0].description}
          </Text>
        </div>

        {/* Middle: Media Slider */}
        <div className={styles.mobileMediaCarousel}>
          <div className={styles.mobileMediaTrack}>
            {[...VISION_MEDIA, ...VISION_MEDIA].map((item, index) => (
              <div key={index} className={styles.mobileMediaItem}>
                <div className={styles.mediaPlaceholder}>
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={styles.media}
                      style={{ transform: item.scale ? `scale(${item.scale})` : undefined }}
                    />
                  ) : (
                    <Image
                      src={item.src}
                      alt="Vision Media"
                      fill
                      className={styles.media}
                      style={{ transform: item.scale ? `scale(${item.scale})` : undefined }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Texture stringently overlaid on the entire scroller area. 
              The #000 container background ensures it naturally hides in the gaps 
              due to color-dodge blend rules. */}
          <div className={styles.textureOverlay}></div>
        </div>

        {/* Bottom: Mission Content */}
        {/* <div className={styles.mobileTextBlock}>
          <Text font="zarid" size="4xl" color="#fff" className={styles.mobileTitle}>
            {VISION_CONTENT[1].title}
          </Text>
          <Text font="zarid" size="lg" color="#B0AEAE" className={styles.mobileDescription}>
            {VISION_CONTENT[1].description}
          </Text>
        </div> */}

        {/* Underneath: Partners Marquee */}
        <div className={styles.mobilePartnersSection}>
          <div className={styles.marqueeTrack}>
            {[...partners, ...partners].map((partner, index) => (
              <a href="#partners" key={index} className={styles.partnerLogoWrapper}>
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={45}
                  height={18}
                  loading="lazy"
                  className={styles.partnerLogo}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="vision-section" ref={containerRef} className={styles.visionSection}>
      <div className={styles.stickyContent}>

        <div className={styles.contentWrapper}>

          {/* Left Side: Media Carousel */}
          <div className={styles.mediaCarouselContainer}>
            <div className={styles.mediaTrackWrapper}>
              <div className={styles.mediaTrack}>
                {/* Infinite scrolling items duplicated for seamless loop */}
                {[...VISION_MEDIA, ...VISION_MEDIA].map((item, index) => (
                  <div key={index} className={styles.mediaItem}>
                    <div className={styles.mediaPlaceholder}>
                      {item.type === 'video' ? (
                        <video
                          src={item.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className={styles.media}
                          style={{ transform: item.scale ? `scale(${item.scale})` : undefined }}
                        />
                      ) : (
                        <Image
                          src={item.src}
                          alt="Vision Media"
                          fill
                          className={styles.media}
                          style={{ transform: item.scale ? `scale(${item.scale})` : undefined }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Texture stringently overlaid on the entire scroller area. */}
            <div className={styles.textureOverlay}></div>
            {/* Overlay gradient on the right of the carousel */}
            <div className={styles.carouselFadeOverlay}></div>
          </div>

          {/* Right Side: Text Content */}
          <div className={styles.textContent}>
            {/* <AnimatePresence mode="wait"> */}
            <div
              // key={activeIndex}
              className={styles.textBlock}
            // initial={{ y: 50, opacity: 0 }}
            // animate={{ y: 0, opacity: 1 }}
            // exit={{ y: -50, opacity: 0 }}
            // transition={{ duration: 0.6, ease: "circOut" }}
            >
              <div className={styles.titleWrapper}>
                <Text font="zarid" size="7xl" weight='extrabold' color="#fff" className={styles.title}>
                  {VISION_CONTENT[0].title}
                </Text>
              </div>
              <Text font="zarid" size="4xl" weight='light' color="#B0AEAE" lineHeight='1' className={styles.description}>
                {VISION_CONTENT[0].description}
              </Text>
              {/* <button
                        className={styles.scrollIconWrapper}
                        onClick={handleScrollClick}
                        aria-label={activeIndex === 0 ? tPlain('visionSection', 'scrollDown') : tPlain('visionSection', 'scrollUp')}
                      >
                        <Image
                          src="/scroll-down.svg"
                          alt={activeIndex === 0 ? tPlain('visionSection', 'scrollDown') : tPlain('visionSection', 'scrollUp')}
                          width={25}
                          height={86}
                          className={styles.scrollIcon}
                          style={{ transform: activeIndex === 1 ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }}
                        />
                      </button> */}
              <div className={styles.scrollIconWrapper}>
                <InteractiveButton onClick={handleScrollClick} />
              </div>
            </div>
            {/* </AnimatePresence> */}
          </div>

        </div>

        {/* Bottom: Partners Marquee (Pure CSS) */}
        <div className={styles.partnersSection}>
          <div className={styles.marqueeTrack}>
            {/* Duplicate the list twice for seamless infinite scroll */}
            {[...partners, ...partners].map((partner, index) => (
              <a href="#partners" key={index} className={styles.partnerLogoWrapper}>
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={70}
                  height={35}
                  loading="eager"
                  className={styles.partnerLogo}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

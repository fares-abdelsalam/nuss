'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Text } from '../Text';
import { RichTextContent } from '../RichTextContent';
import styles from './ServicesSection.module.css';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import type { ServiceItem } from '@/i18n/getServices';

interface ServicePoint {
    title: unknown;
    description: unknown;
}

interface ServiceData {
    id: string;
    key: string;
    title: unknown;
    points: ServicePoint[];
    image: string;
    overlayColor: string;
}



const ServiceCard = ({ data }: { data: ServiceData }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isMobile = useIsMobile();
    const { locale } = useTranslation();
    const isLTR = locale === 'en';

    const textColor = isHovered ? '#FF9400' : '#111';
    const descColor = isHovered ? '#FF9400' : '#555555';

    return (
        <motion.div
            className={styles.card}
            onHoverStart={!isMobile ? () => setIsHovered(true) : undefined}
            onHoverEnd={!isMobile ? () => setIsHovered(false) : undefined}
            onClick={isMobile ? () => setIsHovered(!isHovered) : undefined}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            {/* The expanding background alternates by card position only. */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '1.2rem', // Card padding top
                    left: '1.2rem',
                    right: '1.2rem',
                    height: '230px', // Matches image height
                    backgroundColor: data.overlayColor,
                    zIndex: 0,
                    borderRadius: '0px'
                }}
                animate={{
                    top: isHovered ? 0 : '1.2rem',
                    left: isHovered ? 0 : '1.2rem',
                    right: isHovered ? 0 : '1.2rem',
                    height: isHovered ? '100%' : '230px',
                    opacity: isHovered ? 1 : 1 // Crossfade to card background to ensure text is fully covered cleanly
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            />

            <div className={styles.imageContainer} style={{ zIndex: 1, position: 'relative' }}>
                <motion.div
                    className={styles.svgWrapper}
                    animate={{ rotate: isHovered ? 180 : 0 }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                >
                    <motion.div
                        className={styles.svgMask}
                        style={{ '--icon-src': `url(${data.image})` } as React.CSSProperties}
                        animate={{ backgroundColor: '#FF9400' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        role="img"
                        aria-label={typeof data.title === 'string' ? data.title : data.key}
                    />
                </motion.div>
            </div>

            <div className={styles.contentContainer} style={{ zIndex: 1, position: 'relative' }}>
                {/* Always Expanded Title */}
                <div className={styles.openTitleWrapper}>
                    <motion.div
                        className={styles.openTitle}
                        animate={{ color: textColor }}
                        transition={{ duration: 0.4 }}
                    >
                        <Text as="div" font="zarid" size="2xl" weight="bold" align={isLTR ? "left" : "right"} className={styles.titleText} color="inherit">
                            <RichTextContent value={data.title} />
                        </Text>
                    </motion.div>
                </div>

                <div className={styles.pointsList}>
                    {data.points.map((point, index) => (
                        <div key={`${data.id}-point-${index}`} className={styles.pointItem}>
                            <motion.div animate={{ color: textColor }} transition={{ duration: 0.4 }}>
                                <Text as="div" font="zarid" size="lg" weight="bold" align={isLTR ? "left" : "right"} className={styles.pointTitle} color="inherit">
                                    <RichTextContent value={point.title} />
                                </Text>
                            </motion.div>
                            <motion.div animate={{ color: descColor }} transition={{ duration: 0.4 }}>
                                <Text as="div" font="zarid" size="md" weight="medium" lineHeight={isLTR ? 1.3 : 1.6} align={isLTR ? "left" : "right"} className={styles.pointDesc} color="inherit">
                                    <RichTextContent value={point.description} />
                                </Text>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export const ServicesSection = ({ services }: { services: ServiceItem[] }) => {
    const isMobile = useIsMobile();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);
    const { locale, getValue } = useTranslation();
    const isLTR = locale === 'en';
    const hasServices = services.length > 0;

    const servicesData: ServiceData[] = services.map((service, index) => {
        const isLightCard = index % 2 === 0;

        return {
            id: service.id,
            key: service.key,
            title: service.title,
            image: service.image,
            points: service.points,
            overlayColor: isLightCard ? '#ffffff' : '#414042',
        };
    });

    const scrollToIndex = (index: number) => {
        if (scrollRef.current) {
            const card = scrollRef.current.children[index] as HTMLElement;
            if (card) {
                isScrolling.current = true;
                // use block: nearest so we don't scroll the whole page up/down
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

        if (baseIndex < servicesData.length - 1) {
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
        <section className={styles.section}>
            <div className={styles.textureOverlay}></div>
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <div className={styles.headerRow} style={{ flexDirection: isLTR ? 'row-reverse' : 'row' }}>
                    <div className={styles.titleContainer} style={{ textAlign: isLTR ? 'left' : 'right' }}>
                        <div className={styles.titleWithIcon}>
                            {/* {!isLTR && (
                                <div className={styles.shaddahIcon} style={{ right: isLTR ? 'auto' : '30px', left: isLTR ? '40px' : 'auto' }}>
                                    <Image src="/shaddah.svg" alt="shaddah" width={320} height={22} style={{ transform: isLTR ? 'scaleX(-1)' : 'none' }} />
                                </div>
                            )} */}
                            <Text as="div" font="zarid" size={isMobile ? '4xl' : '7xl'} weight={800} lineHeight={0.82} align={isLTR ? "left" : "right"} color='#000' className={styles.mainTitleText}>
                                <RichTextContent value={getValue('servicesSection', 'mainTitle')} />
                            </Text>
                        </div>
                    </div>

                    <div className={styles.descriptionContainer}>
                        {isMobile ? null : (
                            <Text as="div" font="zarid" size="4xl" color="#555555" align={isLTR ? "left" : "right"} lineHeight={1.05} className={styles.descriptionText}>
                                <RichTextContent value={getValue('servicesSection', 'description')} />
                            </Text>
                        )}
                        {isMobile && (
                            <Text as="div" font="zarid" size="4xl" color="#555555" align={isLTR ? "left" : "right"} lineHeight={1.05} className={styles.descriptionText}>
                                <RichTextContent value={getValue('servicesSection', 'descriptionMobile') || getValue('servicesSection', 'description')} />
                            </Text>
                        )}
                    </div>
                </div>

                <div className={styles.scrollWrapper} style={{ direction: isLTR ? 'ltr' : 'rtl' }}>
                    <div
                        className={styles.cardsGrid}
                        ref={scrollRef}
                        onScroll={handleScroll}
                    >
                        {servicesData.map(service => (
                            <ServiceCard
                                key={service.id}
                                data={service}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.navigation} style={{ flexDirection: isLTR ? 'row-reverse' : 'row' }}>
                    <button
                        onClick={handlePrev}
                        className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
                        disabled={!hasServices || currentIndex === 0}
                        aria-label={locale === 'en' ? 'Previous service' : 'الخدمة السابقة'}
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
                        className={`${styles.navButton} ${currentIndex === servicesData.length - 1 ? styles.disabled : ''}`}
                        disabled={!hasServices || currentIndex === servicesData.length - 1}
                        aria-label={locale === 'en' ? 'Next service' : 'الخدمة التالية'}
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
            </div>
        </section>
    );
};

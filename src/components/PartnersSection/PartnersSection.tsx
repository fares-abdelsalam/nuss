'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Text } from '../Text';
import { RichTextContent } from '../RichTextContent';
import styles from './PartnersSection.module.css';
import { useTranslation } from '@/i18n/LocaleContext';
import type { PartnersSectionData } from '@/i18n/getPartnersSection';
import { useIsMobile } from '@/hooks/useIsMobile';

interface PartnersSectionProps {
  payloadData?: PartnersSectionData;
  profileFileUrl?: string | null;
}

export const PartnersSection = ({ payloadData, profileFileUrl }: PartnersSectionProps) => {
  const { locale, getValue, t } = useTranslation();
  const isLTR = locale === 'en';
  const isMobile = useIsMobile();

  const cmsTitle = payloadData?.title;
  const cmsDescription = payloadData?.description;

  const title = cmsTitle || getValue('partnersSection', 'title');
  const description = cmsDescription || getValue('partnersSection', 'description');
  const partners = payloadData?.partners || [];

  const handleDownloadProfile = () => {
    if (!profileFileUrl) return;
    const link = document.createElement('a');
    link.href = profileFileUrl;
    link.download = '';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <Text
            as="div"
            font="zarid"
            size={isMobile ? "4xl" : "7xl"}
            weight={800}
            align="center"
            className={styles.title}
          >
            <RichTextContent value={title} />
          </Text>
          <Text
            as="div"
            font="zarid"
            size={isMobile ? "xl" : "3xl"}
            color="#888888"
            align="center"
            className={styles.description}
          >
            <RichTextContent value={description} />
          </Text>
        </div>

        <div className={styles.partnersGrid}>
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              className={styles.partnerCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 1) }}
            >
              {partner.logo && (
                <div className={styles.logoWrapper}>
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={160}
                    height={80}
                    className={styles.logo}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Download Profile Button */}
        <div className={styles.downloadWrapper}>
          <button
            className={styles.downloadButton}
            onClick={handleDownloadProfile}
            aria-label="Download Profile"
            style={!profileFileUrl ? { opacity: 0.5, cursor: 'default' } : undefined}
            disabled={!profileFileUrl}
          >
            <div className={styles.buttonWrapper}>
              <div className={styles.buttonContent}>
                <div className={styles.buttonBgFill} />
                <div className={styles.buttonText}>
                  <Text font="zarid" size="md" color="#ffffff" align="center">
                    {t('portfolioSection', 'downloadProfile')}
                  </Text>
                </div>
              </div>
              <div className={styles.arrowCircle}>
                <Image
                  src="/arrow.svg"
                  alt="Arrow"
                  width={20}
                  height={20}
                  className={styles.arrowIcon}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

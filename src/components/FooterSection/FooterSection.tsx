'use client';
import Image from 'next/image';
import { Text } from '@/components/Text';
import { Linkedin, Instagram } from 'lucide-react';
import styles from './FooterSection.module.css';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/i18n/LocaleContext';
import { RichTextContent } from '@/components/RichTextContent';
import type { FooterSectionData } from '@/i18n/getFooterSection';
import {
  LinkedinOutlined,
  InstagramOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  WhatsAppOutlined,
  GlobalOutlined,
  XOutlined,
  TikTokOutlined,
  MailOutlined,
} from '@ant-design/icons';

type FooterSectionProps = {
  footerData?: FooterSectionData;
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'linkedin':
      return <LinkedinOutlined style={{ fontSize: '28px' }} />;
    case 'instagram':
      return <InstagramOutlined style={{ fontSize: '28px' }} />;
    case 'twitter':
      return <XOutlined style={{ fontSize: '26px' }} />;
    case 'facebook':
      return <FacebookOutlined style={{ fontSize: '28px' }} />;
    case 'youtube':
      return <YoutubeOutlined style={{ fontSize: '28px' }} />;
    case 'whatsapp':
      return <WhatsAppOutlined style={{ fontSize: '28px' }} />;
    case 'tiktok':
      return <TikTokOutlined style={{ fontSize: '28px' }} />;
    case 'website':
      return <GlobalOutlined style={{ fontSize: '28px' }} />;
    case 'email':
      return <MailOutlined style={{ fontSize: '28px' }} />;
    default:
      return null;
  }
};

const getSocialHref = (platform: string, url: string) => {
  if (platform !== 'email') {
    return url;
  }

  const emailAddress = url.trim();
  return /^mailto:/i.test(emailAddress) ? emailAddress : `mailto:${emailAddress}`;
};

const isExternalSocialLink = (platform: string) => platform !== 'email';

export const FooterSection = ({ footerData }: FooterSectionProps) => {
  const isMobile = useIsMobile();
  const { t, tPlain } = useTranslation();

  const renderSocials = () => {
    if (footerData?.socialLinks && footerData.socialLinks.length > 0) {
      return (
        <div className={styles.socials}>
          {footerData.socialLinks.map((link, index) => {
            const isExternal = isExternalSocialLink(link.platform);

            return (
              <a
                key={index}
                href={getSocialHref(link.platform, link.url)}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                aria-label={link.platform}
              >
                <PlatformIcon platform={link.platform} />
              </a>
            );
          })}
        </div>
      );
    }

    // Fallback to hardcoded translations if no social links in CMS
    return (
      <div className={styles.socials}>
        <a
          href={tPlain('footerSection', 'socialLinkedinUrl')}
          target="_blank"
          rel="noreferrer"
          aria-label={tPlain('footerSection', 'socialLinkedin')}
        >
          <Linkedin size={28} strokeWidth={1.5} />
        </a>
        <a
          href={tPlain('footerSection', 'socialInstagramUrl')}
          target="_blank"
          rel="noreferrer"
          aria-label={tPlain('footerSection', 'socialInstagram')}
        >
          <Instagram size={28} strokeWidth={1.5} />
        </a>
        <a
          href={tPlain('footerSection', 'socialXUrl')}
          target="_blank"
          rel="noreferrer"
          aria-label={tPlain('footerSection', 'socialX')}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
          </svg>
        </a>
      </div>
    );
  };

  return (
    <footer id="footer" className={styles.footerSection}>
      <div className={styles.mainSection}>
        {/* <div className={styles.textureOverlay}></div> */}
        {!isMobile && <div className={styles.gridOverlay}></div>}

        <div className={styles.content}>
          <Image src="/nuss-icon.svg" alt="NUSS" width={160} height={80} priority />

          <div className={styles.infoContainer}>
            {!isMobile && renderSocials()}

            <div className={styles.textBlock}>
              <Text font="zarid" size={isMobile ? 'xl' : '2xl'} color="#111111" align="center">
                {footerData?.footerText ? (
                  <RichTextContent value={footerData.footerText} />
                ) : (
                  t('footerSection', 'footer')
                )}
              </Text>
            </div>
            {isMobile && renderSocials()}
          </div>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapLink}
        >
          <div className={styles.mapCrop}>
            <img
              src="/map.png"
              alt={tPlain('footerSection', 'mapAlt')}
              className={styles.mapImage}
            />
            <img src="/location-building.png" alt="" aria-hidden="true" className={styles.locationBuilding} />
            <img src="/location-pin.svg" alt="" aria-hidden="true" className={styles.locationPin} />
          </div>
        </a>
      </div>
    </footer>
  );
};

'use client';

import { Navbar } from '@/components/Navbar';
import { RefreshRouteOnSave } from '@/components/LivePreviewRefresh';
import { HeroSection } from '@/components/HeroSection';
import { VisionSection } from '@/components/VisionSection/VisionSection';
import { JourneySection } from '@/components/JourneySection/JourneySection';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { PortfolioSection } from '@/components/PortfolioSection/PortfolioSection';
import { MethodologySection } from '@/components/MethodologySection/MethodologySection';
import { TeamSection } from '@/components/TeamSection/TeamSection';
import { BusinessModelsSection } from '@/components/BusinessModelsSection/BusinessModelsSection';
import { PartnersSection } from '@/components/PartnersSection/PartnersSection';
import { FooterSection } from '@/components/FooterSection/FooterSection';
import { useTranslation } from '@/i18n/LocaleContext';
import type { HomePageData } from '@/i18n/getHomePageData';
import styles from '../page.module.css';

type HomePageClientProps = {
  data: HomePageData;
  serverURL: string;
};

export const HomePageClient = ({ data, serverURL }: HomePageClientProps) => {
  const { resolveLocalized } = useTranslation();
  const activeData = resolveLocalized(data);

  return (
    <>
      <RefreshRouteOnSave serverURL={serverURL} />
      <main className={styles.main}>
        <Navbar />
        <section id="hero"><HeroSection /></section>
        <section id="vision"><VisionSection partners={activeData.partnersData?.partners} /></section>
        <section id="journey">
          <JourneySection
            sectionTitle={activeData.journeySection.sectionTitle}
            introTitle={activeData.journeySection.introTitle}
            introDescription={activeData.journeySection.introDescription}
            journeys={activeData.journeys}
            stats={activeData.journeySection.stats}
          />
        </section>
        <section id="services"><ServicesSection services={activeData.services} /></section>
        <section id="portfolio"><PortfolioSection portfolioData={activeData.portfolioData} /></section>
        <section id="methodology"><MethodologySection payloadData={activeData.methodologyData} /></section>
        <section id="partners">
          <PartnersSection
            payloadData={activeData.partnersData}
            profileFileUrl={activeData.partnersData?.profileFileUrl}
          />
        </section>
        <section id="team"><TeamSection teamData={activeData.teamData} /></section>
        <section id="business"><BusinessModelsSection businessModels={activeData.businessModels} /></section>
        <FooterSection footerData={activeData.footerData} />
      </main>
    </>
  );
};

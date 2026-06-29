import "server-only";
import { cache } from "react";
import type { Localized } from "./config";
import { i18n, type Locale } from "./config";
import { getBusinessModels, type BusinessModelItem } from "./getBusinessModels";
import { getDictionary } from "./getDictionary";
import {
  getJourneySection,
  type JourneySectionData,
} from "./getJourneySection";
import { getJourneys, type JourneyItem } from "./getJourneys";
import {
  getMethodologySection,
  type MethodologySectionData,
} from "./getMethodologySection";
import {
  getPartnersSection,
  type PartnersSectionData,
} from "./getPartnersSection";
import {
  getPortfolioSection,
  type PortfolioSectionData,
} from "./getPortfolioSection";
import { getServices, type ServiceItem } from "./getServices";
import { getFooterSection, type FooterSectionData } from "./getFooterSection";
import { getTeamSection, type TeamSectionData } from "./getTeamSection";

type Dictionary = Record<string, unknown>;

export type HomePageLocaleData = {
  businessModels: BusinessModelItem[];
  dictionary: Dictionary;
  journeySection: JourneySectionData;
  journeys: JourneyItem[];
  methodologyData: MethodologySectionData;
  partnersData: PartnersSectionData;
  portfolioData: PortfolioSectionData;
  services: ServiceItem[];
  footerData: FooterSectionData;
  teamData: TeamSectionData;
};

export type HomePageData = Localized<HomePageLocaleData>;

const getLocaleHomePageData = async (
  locale: Locale,
): Promise<HomePageLocaleData> => {
  // Dictionary first — needed by journeySection and journeys
  const dictionary = await getDictionary(locale);

  // Batch 1: first 3 independent queries (3 connections max simultaneously)
  const [services, businessModels, methodologyData] = await Promise.all([
    getServices(locale),
    getBusinessModels(locale),
    getMethodologySection(locale),
  ]);

  // Batch 2: next 3
  const [portfolioData, partnersData, footerData] = await Promise.all([
    getPortfolioSection(locale),
    getPartnersSection(locale),
    getFooterSection(locale),
  ]);

  // Batch 3: remaining (these use dictionary so kept separate)
  const [journeySection, journeys, teamData] = await Promise.all([
    getJourneySection(locale, dictionary),
    getJourneys(locale, dictionary),
    getTeamSection(locale),
  ]);

  return {
    businessModels,
    dictionary,
    journeySection,
    journeys,
    methodologyData,
    partnersData,
    portfolioData,
    services,
    footerData,
    teamData,
  };
};

export const getHomePageData = cache(async (): Promise<HomePageData> => {
  // Fetch one locale at a time — ar first, then en
  // Peak connections = 3 (one batch) × 1 (one locale at a time) = 3 max
  const result: Partial<HomePageData> = {};
  for (const locale of i18n.locales) {
    result[locale] = await getLocaleHomePageData(locale);
  }
  return result as HomePageData;
});

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
  // 1. Fetch dictionary first (because journeys depend on it)
  const dictionary = await getDictionary(locale);

  // 2. Fire ALL remaining 9 queries at the EXACT same time!
  const [
    services,
    businessModels,
    methodologyData,
    portfolioData,
    partnersData,
    footerData,
    journeySection,
    journeys,
    teamData,
  ] = await Promise.all([
    getServices(locale),
    getBusinessModels(locale),
    getMethodologySection(locale),
    getPortfolioSection(locale),
    getPartnersSection(locale),
    getFooterSection(locale),
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
  // Fetch both locales simultaneously instead of sequentially
  const [ar, en] = await Promise.all([
    getLocaleHomePageData("ar"),
    getLocaleHomePageData("en"),
  ]);

  return { ar, en };
});

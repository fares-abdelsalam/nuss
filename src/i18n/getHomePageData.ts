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
  // Sequential fetches — one connection at a time through the single-slot pool.
  // Slower than Promise.all by ~200-400ms on warm instances, but prevents
  // 18 simultaneous connection attempts on cold starts from exhausting Supabase.
  const dictionary = await getDictionary(locale);
  const services = await getServices(locale);
  const businessModels = await getBusinessModels(locale);
  const journeySection = await getJourneySection(locale, dictionary);
  const journeys = await getJourneys(locale, dictionary);
  const methodologyData = await getMethodologySection(locale);
  const portfolioData = await getPortfolioSection(locale);
  const partnersData = await getPartnersSection(locale);
  const footerData = await getFooterSection(locale);
  const teamData = await getTeamSection(locale);

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
  // Fetch locales one after the other, not in parallel.
  // Two locales × 10 sequential queries = 20 total, but only 1 connection used at any moment.
  const result: Partial<HomePageData> = {};
  for (const locale of i18n.locales) {
    result[locale] = await getLocaleHomePageData(locale);
  }
  return result as HomePageData;
});

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Text } from "./Text";
import styles from "./Navbar.module.css";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/LocaleContext";

const NAV_ITEMS = [
  { key: "home", sectionId: "hero" },
  { key: "services", sectionId: "services" },
  { key: "portfolio", sectionId: "portfolio" },
  { key: "methodology", sectionId: "methodology" },
  { key: "partners", sectionId: "partners" },
  { key: "team", sectionId: "team" },
];

const DARK_SECTION_IDS = ["vision", "portfolio", "methodology", "partners"];

export const Navbar = () => {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [hasDarkBackdrop, setHasDarkBackdrop] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const { t, locale, setLocale, isPending } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.sectionId);
    const observers: IntersectionObserver[] = [];
    const visibilityMap: Record<string, number> = {};

    const updateActive = () => {
      const best = sectionIds.reduce<string | null>((prev, id) => {
        const ratio = visibilityMap[id] ?? 0;
        const prevRatio = prev ? (visibilityMap[prev] ?? 0) : -1;
        return ratio > prevRatio ? id : prev;
      }, null);
      if (best) setActiveSection(best);
    };

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          visibilityMap[id] = entry.intersectionRatio;
          updateActive();
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    const updateNavbarBackdrop = () => {
      frameId = null;
      const nav = navRef.current;
      if (!nav) return;

      const navBottom = nav.getBoundingClientRect().bottom;
      const isOverDarkSection = DARK_SECTION_IDS.some((id) => {
        const section = document.getElementById(id);
        if (!section) return false;

        const rect = section.getBoundingClientRect();
        return rect.top <= navBottom && rect.bottom > navBottom;
      });

      setHasDarkBackdrop(isOverDarkSection);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateNavbarBackdrop);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isSidebarOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.navbar} ${hasDarkBackdrop ? styles.navbarDark : ""}`}
      >
        <div className={styles.logoContainer}>
          <Image
            src="/nuss-icon.svg"
            alt="Nuss Logo"
            width={isMobile ? 60 : 80}
            height={isMobile ? 30 : 40}
            priority
          />
        </div>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map(({ key, sectionId }) => (
            <button
              key={sectionId}
              className={`${styles.navLink} ${activeSection === sectionId ? styles.navLinkActive : ""}`}
              onClick={() => scrollToSection(sectionId)}
            >
              <Text font="zarid" size="xl" weight="medium">
                {t("navbar", key)}
              </Text>
            </button>
          ))}
        </div>

        {isMobile && (
          <button
            className={`${styles.hamburger} ${isSidebarOpen ? styles.hamburgerOpen : ""}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <div
          className={styles.languageContainer}
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          style={{ cursor: "pointer", opacity: isPending ? 0.5 : 1 }}
        >
          <Text font="zarid" size={isMobile ? "md" : "lg"} weight="medium">
            {t("navbar", "langSwitcher")}
          </Text>
          <Image
            src="/globe.svg"
            alt="Language switch"
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
          />
        </div>
      </nav>

      {isMobile && (
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className={styles.sidebarOverlay}
              onClick={() => setIsSidebarOpen(false)}
              initial={{
                backgroundColor: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(0px)",
              }}
              animate={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
              }}
              exit={{
                backgroundColor: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(0px)",
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={styles.sidebarContent}
                onClick={(e) => e.stopPropagation()}
                // You can keep opacity here for the menu items themselves
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, delay: 0.08 }}
              >
                <div className={styles.sidebarLinks}>
                  {NAV_ITEMS.map(({ key, sectionId }, index) => (
                    <motion.button
                      key={sectionId}
                      className={`${styles.sidebarLink} ${activeSection === sectionId ? styles.sidebarLinkActive : ""}`}
                      onClick={() => {
                        scrollToSection(sectionId);
                        setIsSidebarOpen(false);
                      }}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.18 + index * 0.07,
                        duration: 0.35,
                      }}
                    >
                      <Text font="zarid" size="xl" weight="medium">
                        {t("navbar", key)}
                      </Text>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

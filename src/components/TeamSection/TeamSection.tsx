"use client";

import React from "react";
import { Text } from "../Text";
import { RichTextContent } from "@/components/RichTextContent";
import { useTranslation } from "@/i18n/LocaleContext";
import type { TeamSectionData } from "@/i18n/getTeamSection";
import styles from "./TeamSection.module.css";

interface TeamSectionProps {
  teamData?: TeamSectionData;
}

export const TeamSection = ({ teamData }: TeamSectionProps) => {
  const { locale } = useTranslation();
  const isRTL = locale === "ar";
  const title = teamData?.title;
  const description = teamData?.description;
  const managers = teamData?.managers || [];
  const members = teamData?.members || [];

  // Slice members for desktop grid (11 columns layout)
  const row1 = members.slice(0, 11);
  const row2Right = members.slice(11, 16);
  const row2Left = members.slice(16, 17);
  const row3Right = members.slice(17, 22);
  const row3Left = members.slice(22, 23);
  const remainingMembers = members.slice(23);
  const remainingRows = Array.from(
    { length: Math.ceil(remainingMembers.length / 11) },
    (_, rowIndex) => remainingMembers.slice(rowIndex * 11, rowIndex * 11 + 11),
  );

  return (
    <section className={styles.section} id="team" dir={isRTL ? "rtl" : "ltr"}>
      <div className={styles.container}>
        {/* Managers Section */}
        <div className={styles.managersSection}>
          <div className={styles.managersGrid}>
            {managers.map((manager) => (
              <div key={manager.id} className={styles.managerCard}>
                <div className={styles.cardImageContainer}>
                  <div className={styles.backgroundBox} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={manager.image}
                    className={styles.portraitImage}
                    alt={manager.name}
                    style={
                      {
                        "--flip": manager.flip ? -1 : 1,
                        "--scale": manager.scale || 1,
                        "--y-offset": manager.yOffset || "0px",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className={styles.managerInfo}>
                  <Text
                    font="zarid"
                    size="xl"
                    weight={900}
                    className={styles.managerName}
                  >
                    {manager.name}
                  </Text>
                  <Text
                    font="zarid"
                    size="sm"
                    weight={300}
                    className={styles.managerRole}
                  >
                    {manager.role}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Section - Desktop Layout */}
        <div className={styles.desktopMembersContainer}>
          <div className={styles.desktopTitleBlock}>
            <Text
              as="div"
              font="zarid"
              size="7xl"
              weight={700}
              className={styles.desktopTitleText}
            >
              <RichTextContent value={title} />
            </Text>
          </div>

          <div className={styles.desktopMembersGrid}>
            {/* Row 1: 11 cards */}
            {row1.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />{" "}
                </div>
              </div>
            ))}

            {/* Row 2 Right: 5 cards */}
            {row2Right.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}

            {/* Row 2 & 3 Description Block (spans 5 cols, 2 rows) */}
            <div className={styles.desktopDescBlock}>
              <Text
                as="div"
                font="zarid"
                size={isRTL ? "7xl" : "6xl"}
                weight={400}
                className={styles.desktopDescText}
              >
                <RichTextContent value={description} />
              </Text>
            </div>

            {/* Row 2 Left: 1 card */}
            {row2Left.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}

            {/* Row 3 Right: 5 cards */}
            {row3Right.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}

            {/* Row 3 Left: 1 card */}
            {row3Left.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}

            {/* Remaining cards */}
            {remainingRows.map((row, rowIndex) => (
              <div
                key={`remaining-row-${rowIndex}`}
                className={styles.remainingMembersRow}
              >
                {row.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.cardImageContainer}>
                      <div
                        className={`${styles.backgroundBox} ${styles.memberBox}`}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.image}
                        className={styles.portraitImage}
                        alt={member.name || "Team Member"}
                        style={
                          {
                            "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                            "--scale": member.scale || 1, // Zoom level
                            "--y-offset": member.yOffset || "0px", // Nudge up or down
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Members Section - Mobile & Tablet Layout */}
        <div className={styles.mobileMembersContainer}>
          <Text
            as="div"
            font="zarid"
            size="5xl"
            weight="bold"
            className={styles.mobileTitleText}
          >
            <RichTextContent value={title} />
          </Text>

          <div className={styles.mobileManagersGrid}>
            {managers.map((manager) => (
              <div key={manager.id} className={styles.managerCard}>
                <div className={styles.cardImageContainer}>
                  <div className={styles.backgroundBox} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={manager.image}
                    className={styles.portraitImage}
                    alt={manager.name}
                    style={
                      {
                        "--flip": manager.flip ? -1 : 1,
                        "--scale": manager.scale || 1,
                        "--y-offset": manager.yOffset || "0px",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className={styles.managerInfo}>
                  <Text
                    font="zarid"
                    size="xl"
                    weight={900}
                    className={styles.managerName}
                  >
                    {manager.name}
                  </Text>
                  <Text
                    font="zarid"
                    size="xl"
                    weight={400}
                    className={styles.managerRole}
                  >
                    {manager.role}
                  </Text>
                </div>
              </div>
            ))}
          </div>

          <Text
            as="div"
            font="zarid"
            size="5xl"
            weight="medium"
            className={styles.mobileDescText}
          >
            <RichTextContent value={description} />
          </Text>

          <div className={styles.mobileMembersGrid}>
            {members.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardImageContainer}>
                  <div
                    className={`${styles.backgroundBox} ${styles.memberBox}`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    className={styles.portraitImage}
                    alt={member.name || "Team Member"}
                    style={
                      {
                        "--flip": member.flip ? -1 : 1, // -1 flips horizontally
                        "--scale": member.scale || 1, // Zoom level
                        "--y-offset": member.yOffset || "0px", // Nudge up or down
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

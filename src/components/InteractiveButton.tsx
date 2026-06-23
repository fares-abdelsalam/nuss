'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from './InteractiveButton.module.css';

interface InteractiveButtonProps {
    onClick?: () => void;
    className?: string;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({ onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isClicked) return;
    setIsClicked(true);
    if (onClick) {
      onClick();
    }
    resetTimeoutRef.current = window.setTimeout(() => {
      setIsClicked(false);
      setIsHovered(false);
      resetTimeoutRef.current = null;
    }, 900);
  };

  return (
    <button
      type="button"
      className={`${styles.buttonContainer} ${isClicked ? styles.clicked : ''} ${className || ''}`}
      onMouseEnter={() => !isClicked && setIsHovered(true)}
      onMouseLeave={() => !isClicked && setIsHovered(false)}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.buttonBorder}></div>
      <AnimatePresence>
        {(isHovered || isClicked) && (
          <motion.img 
          src="/button-ellipse.svg"
            className={styles.buttonFill}
            initial={isClicked ? false : { y: 145, x: -70, scale: 0.6 }}
            animate={
              isClicked 
                ? { scale: 30, opacity: 0, x: -8, y: -15 } 
                : { y: -15, x: -8, scale: 3, opacity: 1 }
            }
            exit={isClicked ? undefined : { y: 145, x: -80, scale: 0.6 }}
            transition={
              isClicked 
                ? { duration: 1.5, ease: 'easeOut' }
                : { type: "tween", duration: 0.9, ease: "easeOut" }
            }
          />
        )}
      </AnimatePresence>
      
      <motion.div
        className={styles.iconContainer}
        animate={{
          rotate: (isHovered || isClicked) ? -90 : -45,
          filter: (isHovered || isClicked) ? 'brightness(0) invert(1)' : 'none',
          opacity: isClicked ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        <Image 
          src="/arrow.svg" 
          alt="arrow" 
          width={36} 
          height={20} 
          className={styles.arrowIcon}
        />
      </motion.div>
    </button>
  );
};

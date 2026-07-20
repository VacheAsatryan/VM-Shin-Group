import type { Variants } from "motion/react";

/**
 * Centralized Framer Motion animation tokens for VM Shin Group website.
 * Promotes consistency across sections (Hero, Advantages, Production)
 * and avoids duplicated animation variant definitions inside JSX components.
 */

// Stagger container for list/grid items
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

// Fast stagger container for compact grids
export const staggerFastContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

// Standard spring fade-in up reveal
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 75,
      damping: 15,
    },
  },
};

// Subtle fade-in reveal
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Scale-up reveal for media/cards
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 14,
    },
  },
};

// Reduced motion fallbacks (instant opacity fade)
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};

"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ApplicationConfigItem } from "@/config/applications";
import { staggerFastContainer, reducedMotionVariants } from "@/config/animations";
import ApplicationItem from "./ApplicationItem";

interface ApplicationListProps {
  items: ApplicationConfigItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ApplicationList({
  items,
  activeId,
  onSelect,
}: ApplicationListProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = prefersReducedMotion ? reducedMotionVariants : staggerFastContainer;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      role="tablist"
      aria-label="Application categories"
      className="flex flex-col gap-3"
    >
      {items.map((item) => (
        <ApplicationItem
          key={item.id}
          item={item}
          isSelected={item.id === activeId}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </motion.div>
  );
}

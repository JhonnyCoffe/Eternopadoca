"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type TextAnimateType =
  | "rollIn"
  | "whipInUp"
  | "fadeIn"
  | "popIn"
  | "fadeInUp"
  | "shiftInUp"
  | "calmInUp";

interface TextAnimateProps {
  text?: string;
  type?: TextAnimateType;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

type MotionVariant = {
  hidden: Record<string, string | number>;
  visible: Record<string, string | number>;
};

const PRESETS: Record<TextAnimateType, MotionVariant> = {
  rollIn: {
    hidden: { opacity: 0, y: 24, rotate: -10 },
    visible: { opacity: 1, y: 0, rotate: 0 },
  },
  whipInUp: {
    hidden: { opacity: 0, y: 48, rotateX: 60, originY: "100%" },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  popIn: {
    hidden: { opacity: 0, scale: 0.6 },
    visible: { opacity: 1, scale: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  shiftInUp: {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  },
  calmInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};

export function TextAnimate({
  text = "",
  type = "fadeInUp",
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.03,
}: TextAnimateProps) {
  const reduceMotion = useReducedMotion();
  const preset = PRESETS[type];
  const chars = text.split("");

  if (reduceMotion || !text) {
    return (
      <span
        className={["inline-block", className].filter(Boolean).join(" ")}
        style={{ display: "inline-block" }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className={["inline-block", className].filter(Boolean).join(" ")}
      style={{ display: "inline-block" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          initial={preset.hidden}
          whileInView={preset.visible}
          viewport={{ once: true }}
          transition={{
            duration,
            delay: delay + i * stagger,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
  amount?: number;
  y?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  amount = 0.15,
  y = 28,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.95,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Comp
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}

export function RevealStagger({
  children,
  className,
  delayStep = 0.08,
  as = "ul",
}: {
  children: React.ReactNode;
  className?: string;
  delayStep?: number;
  as?: "ul" | "ol" | "div";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : delayStep },
        },
      }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = "li",
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "li" | "div";
  y?: number;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}

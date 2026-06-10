import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
  delay?: number;
  id?: string;
}

export default function ScrollReveal({ children, className, as = 'div', delay = 0, id }: Props) {
  const reduce = useReducedMotion();
  const MotionTag = as === 'section' ? motion.section : motion.div;

  return (
    <MotionTag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

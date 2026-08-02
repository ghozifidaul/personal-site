import { motion, useReducedMotion } from 'motion/react';

interface Props {
  src: string;
  alt: string;
}

export default function HeroImage({ src, alt }: Props) {
  const reduce = useReducedMotion();

  return (
    <figure className="relative bg-neutral-50 border border-neutral-800">
      <motion.img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className="w-full aspect-[4/5] object-cover grayscale contrast-110"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.0,
          ease: [0.23, 1, 0.32, 1],
        }}
      />
      <motion.div
        className="absolute -bottom-3 -left-3 w-24 h-24 bg-accent hidden md:block"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, x: -32, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          opacity: {
            duration: 0.25,
            delay: 0.8,
            ease: 'easeOut',
          },
          x: {
            type: 'spring',
            stiffness: 300,
            damping: 12,
            mass: 0.75,
            delay: 0.8,
          },
          scale: {
            type: 'spring',
            stiffness: 360,
            damping: 14,
            mass: 0.7,
            delay: 0.8,
          },
        }}
      />
    </figure>
  );
}

'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { createContext, useContext, useRef, type RefObject } from 'react';
export const PreviewScrollContext = createContext<RefObject<HTMLElement | null> | undefined>(
  undefined,
);
import { Section } from '@/lib/schema';
export function MotionSection({
  config,
  children,
  disabled,
}: {
  config: Section['motion'];
  children: React.ReactNode;
  disabled: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const container = useContext(PreviewScrollContext);
  const { scrollYProgress } = useScroll({
    container,
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [config.intensity, -config.intensity]);
  const progress = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 1]);
  const p = config.preset;
  const off = disabled || reduce || p === 'none';
  let initial: Record<string, number> = { opacity: 0 };
  if (['fade-up', 'stagger', 'text-reveal'].includes(p)) initial.y = config.intensity;
  if (p === 'slide-left') initial.x = config.intensity;
  if (p === 'slide-right') initial.x = -config.intensity;
  if (p === 'scale-in') initial.scale = 0.85;
  if (p === 'flip') initial.rotateX = 65;
  const animate = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 };
  return (
    <motion.div
      ref={ref}
      initial={
        off || ['parallax', 'scroll-progress', 'hover-lift', 'marquee'].includes(p)
          ? false
          : initial
      }
      animate={
        off
          ? animate
          : p === 'marquee'
            ? { x: [0, -config.intensity, 0] }
            : config.trigger === 'load'
              ? animate
              : undefined
      }
      whileInView={!off && config.trigger === 'scroll' ? animate : undefined}
      whileHover={
        !off
          ? p === 'hover-lift'
            ? { y: -config.intensity / 3 }
            : config.trigger === 'hover'
              ? animate
              : undefined
          : undefined
      }
      viewport={{ root: container, once: !config.repeat, amount: 0.1 }}
      style={
        !off && p === 'parallax'
          ? { y }
          : !off && p === 'scroll-progress'
            ? { scale: progress }
            : undefined
      }
      transition={{
        duration: config.duration,
        delay: config.delay,
        ease: config.easing,
        repeat:
          !off && config.repeat && config.trigger === 'load'
            ? Infinity
            : p === 'marquee' && !off
              ? Infinity
              : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

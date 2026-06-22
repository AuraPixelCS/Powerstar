"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  as?: ElementType;
  delay?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>;

/**
 * Fade-and-rise on scroll, matching the concept's `.reveal` behaviour.
 * Uses a single IntersectionObserver per element; unobserves once shown.
 */
export function Reveal({ as, delay, className = "", children, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  const cls = [
    "reveal",
    delay ? `d${delay}` : "",
    shown ? "in" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // createElement avoids the polymorphic-ElementType children typing that
  // @react-three/fiber's global JSX augmentation otherwise breaks.
  return createElement(Tag, { ref, className: cls, ...rest }, children);
}

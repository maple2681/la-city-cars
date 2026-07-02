import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import countachHero from "../assets/images/countach_user_exact_1782639841613.jpg";

interface ThreeDPlaceholderProps {
  heroImage?: string;
}

export default function ThreeDPlaceholder({ heroImage }: ThreeDPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this banner container relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smoothly transform y translation of the image for a stunning parallax depth
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div
      ref={containerRef}
      id="3D-car-placeholder"
      className="relative w-full rounded-3xl overflow-hidden border border-stone-800 bg-black shadow-2xl aspect-[21/9] min-h-[320px] sm:min-h-[440px] md:min-h-[500px]"
    >
      <motion.img
        style={{ y, scale: 1.15 }}
        src={heroImage || countachHero}
        alt="LA City Cars Showroom Premium Curation"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.75] contrast-[1.05]"
        referrerPolicy="no-referrer"
      />
      {/* Subtle premium gradient reflection overlays */}
      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}



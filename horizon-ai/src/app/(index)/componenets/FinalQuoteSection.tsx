"use client";

import React, { useRef } from 'react';
import { motion, useAnimationControls, useMotionValue, useSpring, MotionValue } from "framer-motion";
import Image from 'next/image';
import { Star, Sparkles, Rocket, Flame, Heart, Smile, Zap } from 'lucide-react';

// Define types for company logos and floating elements
interface CompanyLogo {
  src: string;
  size: number;
}

interface FloatingElementData {
  content: React.ReactNode;
  x: string;
  y: string;
}

const FinalQuoteSection: React.FC = () => {
  // Define company logos
  const companyLogos: CompanyLogo[] = [
    { src: "/images/logo/cmp/1.svg", size: 40 },
    { src: "/images/logo/cmp/2.svg", size: 35 },
    { src: "/images/logo/cmp/3.svg", size: 45 },
    { src: "/images/logo/cmp/4.svg", size: 30 },
    { src: "/images/logo/cmp/5.svg", size: 40 },
    { src: "/images/logo/cmp/6.svg", size: 35 },
  ];

  // Enhanced floating elements with more emojis and random positions
  const floatingElements: FloatingElementData[] = [
    { content: <Star className="w-6 h-6 text-yellow-500" />, x: '15%', y: '20%' },
    { content: <Sparkles className="w-5 h-5 text-blue-500" />, x: '25%', y: '75%' },
    { content: <Rocket className="w-6 h-6 text-red-500" />, x: '40%', y: '30%' },
    { content: <Heart className="w-5 h-5 text-pink-500" />, x: '60%', y: '80%' },
    { content: <Flame className="w-5 h-5 text-orange-500" />, x: '10%', y: '50%' },
    { content: <Smile className="w-6 h-6 text-yellow-400" />, x: '85%', y: '25%' },
    { content: <Zap className="w-5 h-5 text-purple-500" />, x: '75%', y: '40%' },
  ];

  // Custom hook for spring animation
  const useFloating = (): { springX: MotionValue<number>; springY: MotionValue<number>; x: MotionValue<number>; y: MotionValue<number> } => {
    const y = useMotionValue(0);
    const x = useMotionValue(0);
    
    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const springY = useSpring(y, springConfig);
    const springX = useSpring(x, springConfig);

    return { springX, springY, x, y };
  };

  // Props for FloatingElement
  interface FloatingElementProps {
    children: React.ReactNode;
    initialX: string;
    initialY: string;
  }

  // Interactive floating element component
  const FloatingElement: React.FC<FloatingElementProps> = ({ children, initialX, initialY }) => {
    const controls = useAnimationControls();
    const { springX, springY } = useFloating();
    const elementRef = useRef<HTMLDivElement>(null);

    // Random floating animation
    React.useEffect(() => {
      const randomFloat = () => {
        const randomY = Math.random() * 30 - 15;
        const randomX = Math.random() * 20 - 10;
        const duration = 3 + Math.random() * 2;

        controls.start({
          y: randomY,
          x: randomX,
          transition: {
            duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
        });
      };

      randomFloat();
    }, [controls]);

    return (
      <motion.div
        ref={elementRef}
        className="absolute cursor-pointer floating-element"
        style={{
          left: initialX,
          top: initialY,
          x: springX,
          y: springY,
        }}
        animate={controls}
      >
        {children}
      </motion.div>
    );
  };

  // Quote animation variants
  const quoteVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      className="relative py-48 md:py-50 bg-white overflow-hidden"
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        // Update all floating elements
        document.querySelectorAll('.floating-element').forEach((element) => {
          const event = new MouseEvent('mousemove', {
            clientX: e.clientX,
            clientY: e.clientY,
            bubbles: true,
          });
          element.dispatchEvent(event);
        });
      }}
    >
      {/* Floating Logos with spring physics */}
      {companyLogos.map((logo, index) => (
        <FloatingElement
          key={`logo-${index}`}
          initialX={`${20 + (index % 3) * 30}%`}
          initialY={`${10 + (index % 4) * 20}%`}
        >
          <Image
            src={logo.src}
            alt={`Company logo ${index + 1}`}
            width={logo.size}
            height={logo.size}
            className="object-contain opacity-30 hover:opacity-50 transition-opacity"
          />
        </FloatingElement>
      ))}

      {/* Floating Elements with spring physics */}
      {floatingElements.map((element, index) => (
        <FloatingElement
          key={`element-${index}`}
          initialX={element.x}
          initialY={element.y}
        >
          <div className="hover:scale-110 transition-transform">
            {element.content}
          </div>
        </FloatingElement>
      ))}

      {/* Centered Quote */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={quoteVariants}
        className="relative z-10 max-w-3xl mx-auto text-center px-8"
      >
        <blockquote className="text-2xl md:text-3xl font-semibold text-black leading-relaxed mb-8">
          &quot;Lokin is absolutely amazing. It has transformed my network workflow.&quot;
        </blockquote>
        <p className="mt-6 text-lg text-gray-700">
          Pavel Stepanov
        </p>
        <p className="text-base text-gray-500 mt-2">
          Technical Staff at Google
        </p>
      </motion.div>
    </section>
  );
};

export default FinalQuoteSection;
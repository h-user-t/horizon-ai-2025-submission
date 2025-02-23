"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { features } from './types/feature';

const TypingConsole = () => {
  const [displayText, setDisplayText] = React.useState('');
  const consoleText = "~/warp-terminal git:(main) Ready to revolutionize your workflow";

  React.useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= consoleText.length) {
        setDisplayText(consoleText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="bg-black text-white font-mono text-sm px-4 py-2 rounded-t-xl">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        <span>{displayText}</span>
        <span className="animate-pulse">|</span>
      </div>
    </div>
  );
};

const WarpLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  const descriptionVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      scaleY: 0.8,
      paddingTop: 0,
      paddingBottom: 0,
      overflow: 'hidden',
      transformOrigin: 'top',
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      scaleY: 1,
      paddingTop: 8,
      paddingBottom: 16,
      overflow: 'visible',
      transition: {
        height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        scaleY: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3, delay: 0.1, ease: "easeOut" },
        paddingTop: { duration: 0.4, ease: "easeOut" },
        paddingBottom: { duration: 0.4, ease: "easeOut" },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      scaleY: 0.8,
      paddingTop: 0,
      paddingBottom: 0,
      overflow: 'hidden',
      transition: {
        height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        scaleY: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2, ease: "easeIn" },
        paddingTop: { duration: 0.35, ease: "easeIn" },
        paddingBottom: { duration: 0.35, ease: "easeIn" },
      },
    },
  };

  // Animation variants for the image transition
  const imageTransitionVariants = {
    initial: {
      opacity: 0,
      filter: 'blur(8px)', // Starting blur
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)', // Clear image
      transition: {
        opacity: { duration: 0.5, ease: "easeOut" },
        filter: { duration: 0.5, ease: "easeOut" },
      },
    },
    exit: {
      opacity: 0,
      filter: 'blur(8px)', // Blur out
      transition: {
        opacity: { duration: 0.4, ease: "easeIn" },
        filter: { duration: 0.4, ease: "easeIn" },
      },
    },
  };

  return (
    <div className="bg-white min-h-screen text-white">
      <div className="relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <TypingConsole />

          <div className="grid md:grid-cols-2 gap-12 items-start bg-black rounded-b-xl shadow-lg overflow-hidden">
            {/* Left Column - Description */}
            <div className="p-8 md:p-12 space-y-6 flex flex-col min-h-full">
              <motion.div
                custom={0}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex-shrink-0"
              >
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-500">
                  Lokin UX
                </h1>
                <br />
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Experience the command line, unleashed.
                </h1>
                <p className="text-lg text-white/70 mt-4 mb-6 leading-relaxed">
                  Warp comes with quality of life features built-in. Auto-complete commands, edit like an IDE, and customize your terminal from themes to keybindings.
                </p>
              </motion.div>

              <motion.div
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 flex-grow flex flex-col"
              >
                <div className="space-y-4 mt-auto">
                  {features.map((feature) => (
                    <div 
                      key={feature.id}
                      className="bg-white/5 rounded-xl"
                    >
                      <div 
                        onClick={() => {
                          setActiveFeature(feature);
                          setExpandedFeature(expandedFeature === feature.id ? null : feature.id);
                        }}
                        className={`p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                          activeFeature.id === feature.id 
                            ? 'bg-white/10' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <h3 className="text-lg font-semibold">
                            {feature.title}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {feature.shortDescription}
                          </p>
                        </div>
                        {expandedFeature === feature.id ? (
                          <ChevronUp className="w-5 h-5 text-white/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/60" />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFeature === feature.id && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={descriptionVariants}
                            className="px-4 space-y-4 text-white/70 text-sm"
                          >
                            <p>{feature.fullDescription}</p>
                            {isMobile && (
                              <div className="w-full relative" style={{ paddingTop: '200%' }}>
                                <Image 
                                  src={feature.image}
                                  alt={feature.title}
                                  fill
                                  className="object-cover rounded-xl"
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Footer Section */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-white/50 leading-relaxed">
                    © 2025 Lokin. All rights reserved. 
                    Built with passion for developers worldwide.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Background Image + Shrunk Primary Image (Desktop Only) */}
            {!isMobile && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id} // Key ensures animation triggers on feature change
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={imageTransitionVariants}
                  className="relative h-[1080px] w-full"
                  style={{
                    backgroundImage: `url(${activeFeature.bgimage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center px-12">
                    <Image 
                      src={activeFeature.image}
                      alt={activeFeature.title}
                      width={1250}
                      height={868}
                      className="object-contain w-full h-full max-w-[1250px] max-h-[868px]"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarpLandingPage;
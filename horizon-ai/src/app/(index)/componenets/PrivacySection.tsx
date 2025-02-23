"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

const PrivacySection = () => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const privacyFeatures = [
    {
      id: 1,
      title: "Keep content safe and secure",
      shortDescription: "Control access and protect sensitive data",
      fullDescription: "Control access and enable settings that keep secrets out of view. Integrate with LastPass and 1Password.",
      details: "Features: Access control, domain restriction, secret redaction, dynamic environment variables",
      image: "/images/mockup/1-2.jpg"
    },
    {
      id: 2,
      title: "Opt into AI on your own terms",
      shortDescription: "Your data stays private",
      fullDescription: "Natural language detection happens locally. AI only engages when you take action. Your data never trains public models.",
      image: "/images/mockup/more/4.webp"
    },
    {
      id: 3,
      title: "Turn app analytics on or off",
      shortDescription: "You control your data",
      fullDescription: "You decide whether to send your usage data and crash reports to Warp's product team. Use Warp's network log to peak under the hood.",
      image: "/images/mockup/1-3.jpg"
    }
  ];

  const [activeFeature, setActiveFeature] = useState(privacyFeatures[0]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <div className="bg-white text-black">
      <div className="relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start bg-gray-100 rounded-xl shadow-lg overflow-hidden">
            {/* Left Column - Feature Image with Transition (Desktop Only) */}
            {!isMobile && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id} // Key triggers animation on feature change
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={imageTransitionVariants}
                  className="relative h-[600px] w-full"
                >
                  <Image 
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    width={540}
                    height={600}
                    className="object-cover w-full h-full"
                    priority
                    sizes="(max-width: 768px) 100vw, 540px"
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Right Column - Description */}
            <div className="p-8 md:pt-12 md:pr-12 md:pb-6 md:pl-12 space-y-6 flex flex-col min-h-full">
              <motion.div
                custom={0}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex-shrink-0"
              >
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-800">
                  Privacy at Warp
                </h1>
                <p className="text-lg text-gray-600 mt-4 mb-6 leading-relaxed">
                  Transparency and control at every touchpoint.
                </p>
              </motion.div>

              <motion.div
                custom={1}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 flex-grow flex flex-col"
              >
                <div className="space-y-4 mt-auto">
                  {privacyFeatures.map((feature) => (
                    <div 
                      key={feature.id}
                      className="bg-gray-200/50 rounded-xl"
                    >
                      <div 
                        onClick={() => {
                          setActiveFeature(feature);
                          setExpandedFeature(expandedFeature === feature.id ? null : feature.id);
                        }}
                        className={`p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                          activeFeature.id === feature.id 
                            ? 'bg-gray-300/50' 
                            : 'hover:bg-gray-300/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {feature.shortDescription}
                            </p>
                          </div>
                        </div>
                        {expandedFeature === feature.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFeature === feature.id && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={descriptionVariants}
                            className="px-4 space-y-4 text-gray-700 text-sm"
                          >
                            <p>{feature.fullDescription}</p>
                            {feature.details && (
                              <p className="text-gray-600 italic">{feature.details}</p>
                            )}
                            {isMobile && (
                              <div className="w-full relative" style={{ paddingTop: '100%' }}>
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySection;
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from "framer-motion";

const EnterpriseSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null); // Add type to ref
  const controls = useAnimation();

  const features = [
    "Dedicated account manager",
    "Personalized onboarding",
    "SAML-based SSO",
    "Bring your own LLM",
    "Zero data retention",
    "Unlimited Notebooks",
    "Unlimited AI requests",
    "Unlimited Workflows",
    "Private email support",
    "Dedicated Slack channel"
  ];

  const scrollFeatures = [...features, ...features];

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return; // Add null check

    let scrollSpeed = 1;

    // Initial animation
    controls.start({
      y: ["0%", "-50%"],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear"
        }
      }
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sectionTop = scrollElement.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;

      if (scrollPosition > sectionTop - windowHeight && scrollPosition < sectionTop + scrollElement.offsetHeight) {
        const speedMultiplier = 1 + (scrollPosition - (sectionTop - windowHeight)) / windowHeight * 2;
        scrollSpeed = Math.min(3, Math.max(1, speedMultiplier));
        controls.set({ transition: { duration: 20 / scrollSpeed } });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  // Variants for individual item animation with 3D roller effect
  const itemVariants = {
    center: { 
      opacity: 1,
      scale: 1.1,
      rotateX: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    offscreen: { 
      opacity: 0.3,
      scale: 0.9,
      rotateX: 30,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start bg-white overflow-hidden">
            {/* Left Column */}
            <div className="p-8 md:p-12 space-y-6 flex flex-col min-h-full">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Warp for Enterprise
              </h2>
              <h3 className="text-xl md:text-2xl text-black/80 mb-6">
                Boost productivity across your engineering org
              </h3>
              <p className="text-lg text-black/70 leading-relaxed">
                Streamline team onboarding, improve incident response, and encourage AI adoption—with advanced security and compliance to meet company requirements.
              </p>
            </div>

            {/* Right Column - Scrolling Features */}
            <div className="p-8 md:p-12">
              <div className="relative h-[500px] overflow-hidden" style={{ perspective: 1000 }}>
                {/* Improved fade gradients */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />
                
                <motion.div
                  ref={scrollRef}
                  animate={controls}
                  className="absolute w-full"
                >
                  {scrollFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="text-black text-lg md:text-xl py-3 text-center"
                      variants={itemVariants}
                      initial="offscreen"
                      whileInView="center"
                      viewport={{
                        root: scrollRef,
                        amount: 0.5,
                        margin: "0px"
                      }}
                    >
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSection;
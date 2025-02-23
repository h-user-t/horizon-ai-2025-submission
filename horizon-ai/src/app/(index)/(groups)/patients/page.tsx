'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Brain, Clock, Heart, MessageCircle, Shield } from "lucide-react";
import NavbarWaitlist from "@/components/navbar/navbar-landing";
import FooterLanding from "@/components/footer/footer-landing";

const PatientsPage = () => {
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Easy Scheduling",
      description: "Book appointments with your therapist at times that work best for you"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Mental Health Resources",
      description: "Access a library of helpful resources and exercises between sessions"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Secure Messaging",
      description: "Communicate safely with your therapist through our encrypted platform"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#F8FBFF]">
      <NavbarWaitlist />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="text-[#146C94]">Your Journey to</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#146C94] via-[#AFD3E2] to-[#146C94]">
                Better Mental Health
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-[#146C94]/70 leading-relaxed">
              Connect with licensed therapists, schedule sessions at your convenience, and take control of your mental wellness journey with our secure and supportive platform.
            </p>
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/signup-patient">
                <Button className="bg-[#146C94] text-white hover:bg-[#0f4c70] px-8 py-6 text-lg rounded-xl">
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white p-6 rounded-xl shadow-md border border-[#AFD3E2]/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="h-12 w-12 bg-[#146C94]/10 rounded-lg flex items-center justify-center text-[#146C94] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">{feature.title}</h3>
                <p className="text-[#146C94]/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="max-w-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-[#146C94] mb-6">
                Why Choose Our Platform?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-[#146C94] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#146C94]">Flexible Scheduling</h3>
                    <p className="text-[#146C94]/70">Book sessions that fit your schedule, with easy rescheduling options</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-[#146C94] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#146C94]">Secure & Private</h3>
                    <p className="text-[#146C94]/70">Your privacy is our priority with end-to-end encrypted sessions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-[#146C94] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#146C94]">Personalized Care</h3>
                    <p className="text-[#146C94]/70">Get matched with therapists who understand your unique needs</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>

      <FooterLanding />
    </div>
  );
};

export default PatientsPage;
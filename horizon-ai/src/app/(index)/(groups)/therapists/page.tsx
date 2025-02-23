"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NavbarLanding from "@/components/navbar/navbar-landing";
import FooterDashboard from "@/components/footer/footer-landing";
import TestimonialSection from "@/app/(index)/componenets/TestimonialSection";


const TherapistsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarLanding />

      <main className="flex-grow bg-white">
        <section className="space-y-12 mt-8">
          <TestimonialSection />
        </section>

        <section className="mt-12 bg-[#AFD3E2] py-8 text-center">
          <h2 className="text-2xl font-semibold text-[#146C94]">
            Ready to elevate your practice?
          </h2>
          <p className="mt-2 text-lg text-[#146C94]">
            Join our community of leading therapists and unlock innovative tools and insights.
          </p>
          <div className="mt-4">
            <Link href="/signup-therapist">
              <Button variant="outline" className="mx-auto">
                Start Revolutionizing Your Practice
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <FooterDashboard />
    </div>
  );
};

export default TherapistsPage;
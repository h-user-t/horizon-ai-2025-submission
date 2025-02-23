"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const NavbarLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'For Therapists', href: '/therapists' },
    { name: 'For Patients', href: '/patients' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-[#FFFFFF] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="absolute left-0 flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo/therapyAI-black.png" 
                alt="therapyAI Logo" 
                width={100} 
                height={800} 
                className="max-h-10 w-auto"
              />
            </Link>
          </div>

          {/* Centered Desktop Navigation Links */}
          <div className="hidden md:absolute md:inset-x-0 md:flex md:items-center md:justify-center">
            <div className="flex space-x-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#146C94] hover:text-[#F6F1F1] px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[#146C94]"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="absolute right-0 hidden md:flex items-center space-x-4">
            <Link
              href="/signin"
              className="text-[#146C94] hover:text-[#F6F1F1] px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[#146C94] border border-[#146C94]"
            >
              Sign In
            </Link>
            <Link
              href="/signup-patient"
              className="bg-[#AFD3E2] text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:bg-[#146C94] hover:text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="absolute right-0 md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#146C94] hover:text-[#F6F1F1] hover:bg-[#146C94] transition-all duration-200"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#F6F1F1] shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#146C94] hover:text-[#F6F1F1] hover:bg-[#146C94] block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-[#AFD3E2] pt-4 pb-3 space-y-2">
              <Link
                href="/signin"
                className="w-full text-[#146C94] hover:text-[#F6F1F1] hover:bg-[#146C94] block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 border border-[#146C94] text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup-patient"
                className="w-full bg-[#AFD3E2] text-[#146C94] px-3 py-2 rounded-md text-base font-medium hover:bg-[#146C94] hover:text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md block text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarLanding;
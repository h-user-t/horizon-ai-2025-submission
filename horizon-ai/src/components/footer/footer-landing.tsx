'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const FooterDashboard = () => {
	const currentYear = new Date().getFullYear();
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const footerSections = [
		{
			title: 'Platform',
			links: [
				{ label: 'For Therapists', href: '/therapist' },
				{ label: 'For Patients', href: '/patients' },
				{ label: 'AI Session Summary', href: '/ai-summary' },
				{ label: 'Session Management', href: '/session-management' },
				{ label: 'Security & Privacy', href: '/security' },
				{ label: 'Integration APIs', href: '/docs/api' },
			],
		},
		{
			title: 'Company',
			links: [
				{ label: 'About Us', href: '/about' },
				{ label: 'Mental Health Blog', href: '/blog' },
				{ label: 'Success Stories', href: '/stories' },
				{ label: 'Counselor Partnership', href: '/partners' },
				{ label: 'Contact Us', href: '/contact' },
			],
		},
		{
			title: 'Resources',
			links: [
				{ label: 'Help Center', href: '/help' },
				{ label: 'Counselor Community', href: '/community' },
				{ label: 'Patient Resources', href: '/resources' },
				{ label: 'Mental Health Events', href: '/events' },
				{ label: 'Training & Guides', href: '/training' },
			],
		},
		{
			title: 'Legal',
			links: [
				{ label: 'Privacy Policy', href: '/privacy' },
				{ label: 'Terms of Service', href: '/terms' },
				{ label: 'HIPAA Compliance', href: '/hipaa' },
				{ label: 'Data Protection', href: '/data-protection' },
				{ label: 'Platform Status', href: '/status' },
			],
		},
	];
	

	const toggleSection = (title: string) => {
		setExpandedSection(expandedSection === title ? null : title);
	};

	return (
		<footer className='bg-[#FFFFFF]'>
			<div className='relative'>
				{/* Subtle Gradient Background */}
				<div className='absolute inset-0 bg-gradient-to-br from-[#FFFFFF]/10 via-transparent to-[#FFFFFF]/10 pointer-events-none' />

				<div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='py-12 md:py-16'>
						{/* Footer Grid */}
						<div className='hidden md:grid md:grid-cols-4 md:gap-8'>
							{footerSections.map((section) => (
								<div key={section.title}>
									<h3 className='text-sm font-semibold text-[#146C94] uppercase tracking-wider'>{section.title}</h3>
									<ul className='mt-4 space-y-3'>
										{section.links.map((link) => (
											<li key={link.label}>
												<Link
													href={link.href}
													className='text-sm text-[#146C94]/70 hover:text-[#146C94] transition-colors duration-200'
												>
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						{/* Mobile Accordion */}
						<div className='md:hidden space-y-4'>
							{footerSections.map((section) => (
								<div key={section.title} className='border-b border-[#AFD3E2] last:border-0'>
									<button
										onClick={() => toggleSection(section.title)}
										className='flex w-full items-center justify-between py-4 text-sm font-semibold text-[#146C94]'
									>
										<span className='uppercase tracking-wider'>{section.title}</span>
										<ChevronDown
											className={`h-5 w-5 text-[#146C94]/70 transition-transform duration-200 
                      ${expandedSection === section.title ? 'rotate-180' : ''}`}
										/>
									</button>
									{expandedSection === section.title && (
										<ul className='space-y-3 pb-4'>
											{section.links.map((link) => (
												<li key={link.label}>
													<Link
														href={link.href}
														className='text-sm text-[#146C94]/70 hover:text-[#146C94] transition-colors duration-200'
													>
														{link.label}
													</Link>
												</li>
											))}
										</ul>
									)}
								</div>
							))}
						</div>

						{/* Bottom Section */}
						<div className='mt-12 pt-8 border-t border-[#AFD3E2]'>
							<div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
								{/* Logo and Copyright */}
								<div className='flex flex-col items-center gap-4 md:flex-row md:gap-6'>
									<Link href='/' className='text-xl font-bold text-[#146C94] hover:opacity-90 transition-opacity'>
										<Image
											src='/logo/therapyAI-black.png'
											alt='TherapyAI Logo'
											width={80}
											height={80}
											className='max-h-10 w-auto'
										/>
									</Link>
									<p className='text-sm text-[#146C94]/70'>© {currentYear} TherapyAI. Making mental healthcare more accessible.</p>
								</div>

								{/* Social Links */}
								<div className='flex items-center space-x-6'>
									<a
										href='https://github.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-[#146C94]/70 hover:text-[#146C94] transition-colors duration-200'
										aria-label='GitHub'
									>
										<Github className='h-5 w-5' />
									</a>
									<a
										href='https://twitter.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-[#146C94]/70 hover:text-[#146C94] transition-colors duration-200'
										aria-label='Twitter'
									>
										<Twitter className='h-5 w-5' />
									</a>
									<a
										href='https://linkedin.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-[#146C94]/70 hover:text-[#146C94] transition-colors duration-200'
										aria-label='LinkedIn'
									>
										<Linkedin className='h-5 w-5' />
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterDashboard;

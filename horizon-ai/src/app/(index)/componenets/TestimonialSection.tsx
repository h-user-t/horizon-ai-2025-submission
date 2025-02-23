import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
	const fadeInUp = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: 'easeOut',
			},
		},
	};

	const features = [
		{
			title: 'AI-Powered Session Summary',
			description:
				'Get comprehensive session summaries automatically. Remember the issues you discussed, the progress made, and the next steps.',
			image: '/images/mockup/1.jpg',
		},
		{
			title: 'Personalized Journaling Prompts',
			description: 'Dive into your mental health journey with personalized journaling prompts that help you reflect and grow.',
			image: '/images/mockup/2.jpg',
		},
		{
			title: 'Discover Hidden Patterns',
			description: 'Reveal the deeper themes in your mental health journey. Understand your progress and growth over time.',
			image: '/images/mockup/3.jpg',
		},
	];

	return (
		<motion.section initial='hidden' whileInView='visible' viewport={{ once: true }} className='w-full px-24 bg-[#FFFFFF]'>
			<div className='max-w-7xl mx-auto'>
				{/* Section Header */}
				<motion.div variants={fadeInUp} className='text-center mb-16'>
					<h2 className='text-3xl md:text-4xl font-bold text-[#146C94] mb-4'>Transform Your Experience</h2>
					<p className='text-[#146C94]/70 text-lg max-w-2xl mx-auto'>
						Our platform combines cutting-edge AI technology with intuitive tools to enhance your mental health experience.
					</p>
				</motion.div>

				{/* Features Grid */}
				<div className='grid md:grid-cols-3 gap-8'>
					{features.map((feature, index) => (
						<motion.div key={feature.title} variants={fadeInUp} custom={index} className='bg-white rounded-2xl overflow-hidden shadow-lg'>
							<div className='relative h-48 w-full'>
								<Image src={feature.image} alt={feature.title} fill className='object-cover' />
							</div>
							<div className='p-6'>
								<h3 className='text-xl font-semibold text-[#146C94] mb-3'>{feature.title}</h3>
								<p className='text-[#146C94]/70 leading-relaxed'>{feature.description}</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* Bottom Section */}
				<motion.div variants={fadeInUp} className='mt-16 text-center'>
					<div className='inline-flex items-center justify-center p-4 bg-[#AFD3E2]/20 rounded-full mb-4'>
						<Image src='/logo/therapyAI-black.png' alt='TherapyAI Logo' width={1920} height={1080} className='h-8 w-auto' />
					</div>
					<h3 className='text-2xl font-semibold text-[#146C94] mb-3'>Trusted by Mental Health Professionals</h3>
					<p className='text-[#146C94]/70 max-w-2xl mx-auto'>
						Join thousands of mental health professionals who are already using TherapyAI to provide better care for their patients.
					</p>
				</motion.div>
			</div>
		</motion.section>
	);
};

export default FeaturesSection;

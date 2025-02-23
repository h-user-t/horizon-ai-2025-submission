import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const LogoMarquee = () => {
	const logos = [
		{ src: '/images/logo/cmp/1.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/2.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/3.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/4.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/5.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/6.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/7.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/8.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/9.svg', width: 120, height: 32 },
		{ src: '/images/logo/cmp/10.svg', width: 120, height: 32 },
	];

	const scrollRef = useRef(null);
	const controls = useAnimation();

	// Triple logos for seamless looping
	const scrollLogos = [...logos, ...logos, ...logos];

	useEffect(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) return;

		controls.start({
			x: ['0%', '-66.666%'],
			transition: {
				x: {
					repeat: Infinity,
					repeatType: 'loop',
					duration: 25,
					ease: 'linear',
				},
			},
		});

		const handleVisibilityChange = () => {
			if (document.hidden) {
				controls.stop();
			} else {
				controls.start({
					x: ['0%', '-66.666%'],
					transition: {
						x: {
							repeat: Infinity,
							repeatType: 'loop',
							duration: 25,
							ease: 'linear',
						},
					},
				});
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			controls.stop();
		};
	}, [controls]);

	const logoVariants = {
		visible: {
			opacity: 0.6,
			transition: { duration: 0.5 },
		},
		hover: {
			opacity: 1,
			transition: { duration: 0.3 },
		},
	};

	return (
		<section className='py-12 bg-white'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6'>
				<p className='text-center mb-6 text-base sm:text-lg' style={{ color: '#146C94' }}>
					Recommended by over 6,000 therapists at leading companies!
				</p>

				<div className='relative overflow-hidden'>
					{/* Fade gradients */}
					<div
						className='absolute inset-y-0 left-0 w-8 sm:w-12 z-10 pointer-events-none'
						style={{
							background: 'linear-gradient(to right, white, transparent)',
						}}
					/>
					<div
						className='absolute inset-y-0 right-0 w-8 sm:w-12 z-10 pointer-events-none'
						style={{
							background: 'linear-gradient(to left, white, transparent)',
						}}
					/>

					<motion.div
						ref={scrollRef}
						animate={controls}
						className='flex whitespace-nowrap will-change-transform'
						style={{
							width: '300%',
						}}
					>
						{scrollLogos.map((logo, index) => (
							<motion.div
								key={`${logo.src}-${index}`}
								className='flex items-center justify-center flex-shrink-0 px-3 sm:px-5 md:px-7'
								variants={logoVariants}
								initial='visible'
								whileHover='hover'
							>
								<img
									src={logo.src}
									alt='Company logo'
									width={logo.width}
									height={logo.height}
									className='h-5 sm:h-6 w-auto max-w-[100px] sm:max-w-[120px]'
									style={{
										filter: `brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(626%) hue-rotate(173deg) brightness(93%) contrast(97%)`,
										objectFit: 'contain',
									}}
									loading='lazy'
									onError={(e) => console.error(`Failed to load image: ${logo.src}`, e)}
								/>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default LogoMarquee;

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorFollower() {
	const [isVisible, setIsVisible] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [isTouchDevice, setIsTouchDevice] = useState(false);

	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// High stiffness, low damping for exact following
	const springX = useSpring(x, { stiffness: 500, damping: 28 });
	const springY = useSpring(y, { stiffness: 500, damping: 28 });

	useEffect(() => {
		// Check if touch device
		const isTouch = window.matchMedia('(pointer: coarse)').matches;
		setIsTouchDevice(isTouch);

		if (isTouch) return;

		const handleMouseMove = (e: MouseEvent) => {
			x.set(e.clientX - 16);
			y.set(e.clientY - 16);
			setIsVisible(true);
		};

		const handleMouseLeave = () => {
			setIsVisible(false);
		};

		const handleMouseEnter = () => {
			setIsVisible(true);
		};

		// Track hover on interactive elements
		const handleElementMouseEnter = () => setIsHovering(true);
		const handleElementMouseLeave = () => setIsHovering(false);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);

		// Add hover listeners to interactive elements
		const interactiveElements = document.querySelectorAll(
			'a, button, [role="button"], input, textarea, select'
		);
		interactiveElements.forEach((el) => {
			el.addEventListener('mouseenter', handleElementMouseEnter);
			el.addEventListener('mouseleave', handleElementMouseLeave);
		});

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
			document.removeEventListener('mouseenter', handleMouseEnter);
			interactiveElements.forEach((el) => {
				el.removeEventListener('mouseenter', handleElementMouseEnter);
				el.removeEventListener('mouseleave', handleElementMouseLeave);
			});
		};
	}, [x, y]);

	// Don't render on touch devices
	if (isTouchDevice) return null;

	return (
		<motion.div
			className="fixed top-0 left-0 rounded-full bg-neutral-400/30 dark:bg-neutral-300/30 backdrop-blur-sm pointer-events-none z-[9999] border-2 border-neutral-600/50 dark:border-neutral-300/50"
			style={{
				x: springX,
				y: springY,
			}}
			animate={{
				width: isHovering ? 48 : 32,
				height: isHovering ? 48 : 32,
				opacity: isVisible ? (isHovering ? 0.7 : 0.5) : 0,
			}}
			transition={{
				width: { type: 'spring', stiffness: 300, damping: 20 },
				height: { type: 'spring', stiffness: 300, damping: 20 },
				opacity: { duration: 0.2 },
			}}
		/>
	);
}

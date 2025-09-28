'use client'
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const GradientCard = ({ 
  children, 
  className = "", 
  width = "360px", 
  height = "450px",
  glowIntensity = "normal", // "subtle", "normal", "intense"
  gradientColors = {
    primary: "rgba(172, 92, 255, 0.7)",
    secondary: "rgba(79, 70, 229, 0)",
    accent: "rgba(56, 189, 248, 0.7)"
  }
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      // Calculate mouse position relative to card center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Calculate rotation (limited range for subtle effect)
      const rotateX = -(y / rect.height) * 5; // Max 5 degrees rotation
      const rotateY = (x / rect.width) * 5; // Max 5 degrees rotation

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  // Reset rotation when not hovering
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const glowSettings = {
    subtle: { opacity: 0.4, blur: 25 },
    normal: { opacity: 0.7, blur: 40 },
    intense: { opacity: 0.9, blur: 50 }
  };

  const currentGlow = glowSettings[glowIntensity] || glowSettings.normal;

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-[24px] overflow-hidden ${className}`}
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        backgroundColor: "#0e131f",
        boxShadow: `0 -10px 100px 10px ${gradientColors.primary.replace('0.7', '0.25')}, 0 0 10px 0 rgba(0, 0, 0, 0.5)`,
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-35 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(2px)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
          rotateX: -rotation.x * 0.2,
          rotateY: -rotation.y * 0.2,
          z: 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Dark background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #000000 70%)",
        }}
        animate={{
          z: -1
        }}
      />

      {/* Noise texture overlay */}
      <motion.div
        className="absolute inset-0 opacity-30 mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{
          z: -0.5
        }}
      />

      {/* Purple/blue glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, ${gradientColors.primary} -10%, ${gradientColors.secondary} 70%),
            radial-gradient(ellipse at bottom left, ${gradientColors.accent} -10%, ${gradientColors.secondary} 70%)
          `,
          filter: `blur(${currentGlow.blur}px)`,
        }}
        animate={{
          opacity: isHovered ? currentGlow.opacity + 0.1 : currentGlow.opacity,
          y: isHovered ? rotation.x * 0.5 : 0,
          z: 0
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Enhanced bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
        style={{
          background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
        animate={{
          boxShadow: isHovered
            ? `0 0 20px 4px ${gradientColors.primary.replace('0.7', '0.9')}, 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px ${gradientColors.accent.replace('0.7', '0.5')}`
            : `0 0 15px 3px ${gradientColors.primary.replace('0.7', '0.8')}, 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px ${gradientColors.accent.replace('0.7', '0.4')}`,
          opacity: isHovered ? 1 : 0.9,
          z: 0.5
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Card content */}
      <motion.div
        className="relative h-full z-40"
        animate={{
          z: 2,
          rotateX: isHovered ? -rotation.x * 0.1 : 0,
          rotateY: isHovered ? -rotation.y * 0.1 : 0
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default GradientCard;
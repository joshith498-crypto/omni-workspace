import React, { useState, useRef, MouseEvent } from 'react';

export type GlowPreset = 'indigo' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'neutral';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: GlowPreset;
  enableTilt?: boolean;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const GLOW_COLORS: Record<GlowPreset, { spotlight: string; aura: string; border: string }> = {
  indigo: {
    spotlight: 'rgba(99, 102, 241, 0.16)',
    aura: 'rgba(99, 102, 241, 0.25)',
    border: 'rgba(129, 140, 248, 0.45)',
  },
  cyan: {
    spotlight: 'rgba(6, 182, 212, 0.16)',
    aura: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(34, 211, 238, 0.45)',
  },
  emerald: {
    spotlight: 'rgba(16, 185, 129, 0.16)',
    aura: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(52, 211, 153, 0.45)',
  },
  violet: {
    spotlight: 'rgba(168, 85, 247, 0.16)',
    aura: 'rgba(168, 85, 247, 0.25)',
    border: 'rgba(192, 132, 252, 0.45)',
  },
  amber: {
    spotlight: 'rgba(245, 158, 11, 0.16)',
    aura: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(251, 191, 36, 0.45)',
  },
  neutral: {
    spotlight: 'rgba(255, 255, 255, 0.08)',
    aura: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.25)',
  },
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  glow = 'indigo',
  enableTilt = true,
  className = '',
  onClick,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const colors = GLOW_COLORS[glow];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Gentle tilt angle (max 5 degrees for professional stability)
      const rotX = ((y - centerY) / centerY) * -4.5;
      const rotY = ((x - centerX) / centerX) * 4.5;
      setRotate({ x: rotX, y: rotY });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const transformStyle = enableTilt && isHovered
    ? `perspective(1000px) rotateX(${rotate.x.toFixed(2)}deg) rotateY(${rotate.y.toFixed(2)}deg) translateZ(3px)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? 'transform 0.1s ease-out, box-shadow 0.25s ease'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        boxShadow: isHovered
          ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 16px 36px -10px rgba(0, 0, 0, 0.8), 0 0 30px -8px ${colors.aura}`
          : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 10px 24px -10px rgba(0, 0, 0, 0.6)',
        borderColor: isHovered ? colors.border : undefined,
      }}
      className={`relative rounded-xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-xl overflow-hidden transition-colors ${className}`}
      {...rest}
    >
      {/* 3D Top Specular Light Rim */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Dynamic Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.spotlight}, transparent 75%)`,
        }}
      />

      {/* Content wrapper with isolation for crisp layering */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

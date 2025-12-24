'use client';

import { useEffect, useRef, useState } from 'react';

interface Background3DProps {
    variant?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
    intensity?: 'low' | 'medium' | 'high';
}

interface Particle {
    top: number;
    left: number;
    delay: number;
    duration: number;
}

export default function Background3D({ variant = 'purple', intensity = 'medium' }: Background3DProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [particles, setParticles] = useState<Particle[]>([]);

    // Generate random particles only on client side
    useEffect(() => {
        const newParticles: Particle[] = Array.from({ length: 12 }, () => ({
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 15 + Math.random() * 10,
        }));
        setParticles(newParticles);
    }, []);

    // Color schemes for different variants
    const colorSchemes = {
        purple: {
            primary: 'rgb(168, 85, 247)',
            secondary: 'rgb(236, 72, 153)',
            accent: 'rgb(59, 130, 246)',
        },
        blue: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(6, 182, 212)',
            accent: 'rgb(168, 85, 247)',
        },
        green: {
            primary: 'rgb(34, 197, 94)',
            secondary: 'rgb(16, 185, 129)',
            accent: 'rgb(59, 130, 246)',
        },
        orange: {
            primary: 'rgb(251, 146, 60)',
            secondary: 'rgb(251, 191, 36)',
            accent: 'rgb(239, 68, 68)',
        },
        pink: {
            primary: 'rgb(236, 72, 153)',
            secondary: 'rgb(168, 85, 247)',
            accent: 'rgb(59, 130, 246)',
        },
    };

    const colors = colorSchemes[variant];
    const opacityMultiplier = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.25 : 0.35;

    return (
        <div ref={canvasRef} className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large Gradient Orbs */}
            <div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
                style={{
                    background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
                    opacity: opacityMultiplier,
                }}
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
                style={{
                    background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
                    opacity: opacityMultiplier,
                    animationDelay: '1s',
                }}
            />
            <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-float"
                style={{
                    background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
                    opacity: opacityMultiplier * 0.8,
                    animationDelay: '2s',
                }}
            />

            {/* Geometric Shapes */}
            <div
                className="absolute top-20 right-20 w-32 h-32 border-2 rounded-lg rotate-45 animate-spin"
                style={{
                    borderColor: `${colors.primary}30`,
                    animationDuration: '20s',
                }}
            />
            <div
                className="absolute bottom-20 left-20 w-24 h-24 border-2 rounded-full animate-pulse"
                style={{
                    borderColor: `${colors.secondary}30`,
                }}
            />
            <div
                className="absolute top-1/3 right-1/3 w-16 h-16 rounded-lg animate-bounce"
                style={{
                    background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                    animationDuration: '3s',
                }}
            />

            {/* Small Floating Particles - Only render after client-side hydration */}
            {particles.map((particle, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-float-slow"
                    style={{
                        background: colors.primary,
                        opacity: 0.3,
                        top: `${particle.top}%`,
                        left: `${particle.left}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                    }}
                />
            ))}

            {/* Rotating Rings */}
            <div
                className="absolute top-1/4 right-1/4 w-64 h-64 border border-dashed rounded-full animate-spin-slow"
                style={{
                    borderColor: `${colors.accent}20`,
                }}
            />
            <div
                className="absolute bottom-1/3 left-1/3 w-48 h-48 border border-dashed rounded-full animate-spin-reverse"
                style={{
                    borderColor: `${colors.primary}20`,
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        </div>
    );
}

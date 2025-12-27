import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'default' | 'white' | 'gradient';
}

export function MahasiAILogo({ className = '', showText = true, variant = 'gradient' }: LogoProps) {
    const getColors = () => {
        switch (variant) {
            case 'white':
                return {
                    primary: '#ffffff',
                    secondary: '#ffffff',
                    accent: '#ffffff',
                };
            case 'gradient':
                return {
                    primary: 'url(#logo-gradient)',
                    secondary: '#8b5cf6',
                    accent: '#3b82f6',
                };
            default:
                return {
                    primary: '#3b82f6',
                    secondary: '#8b5cf6',
                    accent: '#06b6d4',
                };
        }
    };

    const colors = getColors();

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>

                {/* Outer circle */}
                <circle cx="20" cy="20" r="18" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.3" />

                {/* Neural network nodes */}
                <circle cx="20" cy="8" r="2.5" fill={colors.primary} />
                <circle cx="12" cy="16" r="2.5" fill={colors.secondary} />
                <circle cx="28" cy="16" r="2.5" fill={colors.accent} />
                <circle cx="10" cy="28" r="2.5" fill={colors.primary} />
                <circle cx="20" cy="32" r="2.5" fill={colors.secondary} />
                <circle cx="30" cy="28" r="2.5" fill={colors.accent} />
                <circle cx="20" cy="20" r="3" fill={colors.primary} />

                {/* Connecting lines */}
                <line x1="20" y1="8" x2="12" y2="16" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="8" x2="28" y2="16" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
                <line x1="12" y1="16" x2="20" y2="20" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
                <line x1="28" y1="16" x2="20" y2="20" stroke={colors.accent} strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="20" x2="10" y2="28" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="20" x2="20" y2="32" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="20" x2="30" y2="28" stroke={colors.accent} strokeWidth="1.5" opacity="0.6" />

                {/* Data flow particles */}
                <circle cx="16" cy="12" r="1" fill={colors.accent} opacity="0.8">
                    <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="24" cy="12" r="1" fill={colors.secondary} opacity="0.8">
                    <animate
                        attributeName="opacity"
                        values="0.2;0.8;0.2"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="15" cy="24" r="1" fill={colors.primary} opacity="0.8">
                    <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="2.5s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="25" cy="24" r="1" fill={colors.accent} opacity="0.8">
                    <animate
                        attributeName="opacity"
                        values="0.2;0.8;0.2"
                        dur="2.5s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>

            {showText && (
                <div className="flex flex-col">
                    <span className="text-xl font-bold gradient-text leading-none">
                        MAHASI AI
                    </span>
                    <span className="text-[10px] text-muted-foreground tracking-wider">
                        REAL-TIME INSIGHTS
                    </span>
                </div>
            )}
        </div>
    );
}

// Icon-only version for small spaces
export function MahasiAIIcon({ className = '', variant = 'gradient' }: Omit<LogoProps, 'showText'>) {
    return <MahasiAILogo className={className} showText={false} variant={variant} />;
}

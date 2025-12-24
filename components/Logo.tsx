import { Trophy } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTagline?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showTagline = false, className = '' }: LogoProps) {
    const sizes = {
        sm: { text: 'text-xl', icon: 'w-5 h-5', tagline: 'text-[8px]' },
        md: { text: 'text-2xl', icon: 'w-6 h-6', tagline: 'text-[10px]' },
        lg: { text: 'text-4xl', icon: 'w-8 h-8', tagline: 'text-xs' },
        xl: { text: 'text-5xl md:text-6xl', icon: 'w-12 h-12', tagline: 'text-sm' },
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Trophy className={`${currentSize.icon} text-purple-500`} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
                <span className={`${currentSize.text} font-bold gradient-text tracking-tight`}>
                    MAHASI.TECH
                </span>
            </div>
            {showTagline && (
                <p className={`${currentSize.tagline} text-gray-400 mt-1 font-medium tracking-wide`}>
                    Mahasiswa Berprestasi, Teknologi Terdepan
                </p>
            )}
        </div>
    );
}

'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
    fallback?: string;
    blurDataURL?: string;
    containerClassName?: string;
}

/**
 * Optimized lazy-loading image component with blur-up effect
 * Features:
 * - Intersection Observer for lazy loading
 * - Blur-up placeholder effect
 * - Fade-in animation when loaded
 * - Automatic error handling
 */
export function LazyImage({
    src,
    alt,
    fallback = '/placeholder.png',
    blurDataURL,
    className,
    containerClassName,
    ...props
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setError(true);
        setIsLoaded(true);
    };

    return (
        <div
            ref={imgRef}
            className={cn(
                'relative overflow-hidden bg-muted',
                containerClassName
            )}
        >
            {/* Blur placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 skeleton animate-pulse" />
            )}

            {/* Actual image */}
            {isInView && (
                <Image
                    src={error ? fallback : src}
                    alt={alt}
                    className={cn(
                        'transition-opacity duration-500',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                        className
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    placeholder={blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={blurDataURL}
                    {...props}
                />
            )}
        </div>
    );
}

/**
 * Simple skeleton loader for images
 */
export function ImageSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'skeleton animate-pulse rounded-lg',
                className
            )}
        />
    );
}

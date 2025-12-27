'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param options - Configuration options for the intersection observer
 * @returns ref to attach to element and isVisible state
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = true,
    } = options;

    const elementRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Create intersection observer
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);

                    // If triggerOnce is true, stop observing after first trigger
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        // Cleanup
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref: elementRef, isVisible };
}

/**
 * Hook for staggered animations on list items
 * @param itemCount - Number of items to stagger
 * @param delayIncrement - Delay increment in milliseconds (default: 100ms)
 * @returns Array of delay values
 */
export function useStaggerAnimation(itemCount: number, delayIncrement: number = 100) {
    return Array.from({ length: itemCount }, (_, i) => i * delayIncrement);
}

/**
 * Hook to add/remove animation classes with cleanup
 * @param animationClass - CSS animation class to apply
 * @param duration - Duration in milliseconds (default: 300ms)
 */
export function useAnimation(animationClass: string, duration: number = 300) {
    const [isAnimating, setIsAnimating] = useState(false);

    const trigger = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), duration);
    };

    return { isAnimating, trigger, className: isAnimating ? animationClass : '' };
}

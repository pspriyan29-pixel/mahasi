'use client';

import { useEffect } from 'react';

/**
 * Initialize scroll reveal animations
 * Adds 'revealed' class to elements with 'scroll-reveal' class when they enter viewport
 */
export function initScrollReveal() {
    if (typeof window === 'undefined') return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with scroll-reveal class
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
        elements.forEach((el) => observer.unobserve(el));
    };
}

/**
 * Hook to initialize scroll reveal on mount
 */
export function useScrollReveal() {
    useEffect(() => {
        const cleanup = initScrollReveal();
        return cleanup;
    }, []);
}

/**
 * Add animating class during animation, remove after
 */
export function addAnimationClass(element: HTMLElement, animationClass: string, duration: number = 300) {
    element.classList.add(animationClass, 'animating');

    setTimeout(() => {
        element.classList.remove('animating');
        element.classList.add('animation-complete');
    }, duration);
}

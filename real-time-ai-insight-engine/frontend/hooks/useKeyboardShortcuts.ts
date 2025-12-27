'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.callback();
                    break;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return shortcuts;
}

// Common shortcuts for the application
export const commonShortcuts: ShortcutConfig[] = [
    {
        key: 'k',
        ctrl: true,
        description: 'Open command palette',
        callback: () => {
            // Trigger command palette
            const event = new CustomEvent('open-command-palette');
            window.dispatchEvent(event);
        },
    },
    {
        key: '/',
        description: 'Focus search',
        callback: () => {
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            searchInput?.focus();
        },
    },
    {
        key: 'Escape',
        description: 'Close modal/dialog',
        callback: () => {
            const event = new CustomEvent('close-modal');
            window.dispatchEvent(event);
        },
    },
];

'use client';

import { useEffect, useRef } from 'react';

export default function AdInFeed() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            initialized.current = true;
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className="w-full py-4 overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="fluid"
                data-ad-layout-key="-fa-u+1v-4z+9z"
                data-ad-client="ca-pub-6133261181364771"
                data-ad-slot="1430643846"
            />
        </div>
    );
}

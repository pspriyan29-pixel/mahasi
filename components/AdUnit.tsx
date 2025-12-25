'use client';

import { useEffect, useRef } from 'react';

export default function AdUnit() {
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
        <div className="container-custom py-8 flex justify-center overflow-hidden">
            {/* mahasi */}
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6133261181364771"
                data-ad-slot="6752728063"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}

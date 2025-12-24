export default function StructuredData() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'MAHASI.TECH - Platform Lomba Mahasiswa Indonesia',
        alternateName: 'Platform Lomba Mahasiswa Indonesia',
        url: 'https://mahasi.tech',
        logo: 'https://mahasi.tech/logo-transparent.png',
        description: 'Platform kompetisi digital untuk mahasiswa Indonesia. Ikuti lomba coding, desain, dan inovasi teknologi.',
        slogan: 'Mahasiswa Berprestasi, Teknologi Terdepan',
        foundingDate: '2024',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kampar',
            addressRegion: 'Riau',
            addressCountry: 'ID',
        },
        sameAs: [
            'https://facebook.com/mahasi.tech',
            'https://instagram.com/mahasi.tech',
            'https://twitter.com/mahasi_tech',
        ],
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MAHASI.TECH',
        url: 'https://mahasi.tech',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mahasi.tech/competitions?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    );
}

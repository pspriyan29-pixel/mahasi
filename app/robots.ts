import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/admin/', '/instructor/'],
            },
        ],
        sitemap: 'https://mahasi.tech/sitemap.xml',
    };
}

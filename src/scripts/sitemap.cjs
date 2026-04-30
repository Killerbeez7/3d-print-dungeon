const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

const sitemap = new SitemapStream({ hostname: 'https://print-dungeon-3d.firebaseapp.com' });

[
    '/',
    '/search',
    '/search/artists',
    '/artists',
    '/collections',
    '/events',
    '/blog',
    '/marketplace',
    '/marketplace/featured',
    '/marketplace/new-arrivals',
    '/marketplace/best-sellers',
    '/printed-figures',
    '/forum',
    '/forum/category/general',
    '/forum/rules',
    '/forum/help',
    '/business/bulk-orders',
    '/business/custom-solutions',
    '/business/enterprise-suite',
    '/policies',
    '/policies/privacy',
    '/policies/terms',
    '/policies/cookies',
    '/policies/refund',
].forEach(route => sitemap.write({ url: route, changefreq: 'weekly', priority: 0.8 }));

sitemap.end();

streamToPromise(sitemap).then(data =>
    createWriteStream('public/sitemap.xml').end(data)
);

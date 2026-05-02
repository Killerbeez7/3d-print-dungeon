const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

const sitemap = new SitemapStream({ hostname: 'https://print-dungeon-3d.firebaseapp.com' });

[
    '/',
    '/search',
    '/maintenance',
    '/artists',
    '/artists/12345',
    '/collections',
    '/events',
    '/blog',
    '/forum',
    '/forum/category/general',
    '/forum/thread/67890',
    '/forum/dashboard',
    '/forum/my-threads',
    '/forum/rules',
    '/forum/help',
    '/marketplace/featured',
    '/marketplace/new-arrivals',
    '/marketplace/best-sellers',
    '/business/bulk-orders',
    '/business/custom-solutions',
    '/business/enterprise-suite',
    '/competitions',
    '/model/abcde',
].forEach(route => sitemap.write({ url: route, changefreq: 'weekly', priority: 0.8 }));

sitemap.end();

streamToPromise(sitemap).then(data =>
    createWriteStream('public/sitemap.xml').end(data)
);
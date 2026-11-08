/* ==========================================================================
   functions/_middleware.js
   --------------------------------------------------------------------------
   Bloqueio de borda — roda ANTES de qualquer Function ou asset.
   Regras:
     1. IP com ASN da Meta (32934 / 63293 / 54115) → 404.
     2. User-Agent contendo padrões de bot/crawler → 404.
     3. User-Agent vazio ou "curto demais" → 404 (scraper agressivo).
     4. Qualquer outro (humano + WebView do Instagram) → next().
   ========================================================================== */

const META_ASNS = new Set([
    32934,  // Facebook / Meta
    63293,  // Meta (Facebook) — segundo ASN
    54115,  // Meta / WhatsApp
]);

const BLOCKED_UA_PATTERNS = [
    // Meta / Instagram bots
    'facebookexternalhit',
    'meta-externalagent',
    'meta-externalfetcher',
    'facebookcatalog',
    'facebookplatform',
    'facebot',
    'instagramexternalhit',

    // Crawlers genéricos / scrapers
    'bot',
    'spider',
    'crawler',
    'scraper',

    // Ferramentas óbvias de scraping
    'python-requests',
    'python-urllib',
    'curl/',
    'wget/',
    'httpclient',
    'go-http-client',
    'node-fetch',
    'axios/',
    'okhttp/',
    'headlesschrome',
    'phantomjs',
    'puppeteer',
    'selenium',
];

export async function onRequest(context) {
    const { request, next } = context;
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();
    const cf = request.cf || {};
    const asn = Number(cf.asn);

    // 1) Bloqueio por IP (ASN da Meta) — mais confiável que UA.
    if (Number.isFinite(asn) && META_ASNS.has(asn)) {
        return new Response('Not Found', {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    // 2) Bloqueio por padrões de UA.
    if (BLOCKED_UA_PATTERNS.some(pattern => ua.includes(pattern))) {
        return new Response('Not Found', {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    // 3) UA vazio / absurdamente curto → scraper.
    if (ua.length < 10) {
        return new Response('Not Found', {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    // 4) Deixa passar.
    return next();
}
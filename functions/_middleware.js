
/*
 * RAIANE LEIT — Cloudflare Pages Middleware
 *
 * Compatibilidade com Instagram WebView:
 * - Não bloqueia usuários pelo ASN da Meta.
 * - Bloqueia User-Agents conhecidos de bots e ferramentas de scraping.
 * - Não exige cf_clearance no middleware.
 * - Deixa a autenticação específica das rotas para cada Function.
 */

const BLOCKED_UA_PATTERNS = [
    // Crawlers e robôs identificáveis
    'facebookexternalhit',
    'meta-externalagent',
    'meta-externalfetcher',
    'facebookcatalog',
    'facebookplatform',
    'facebot',
    'instagramexternalhit',
    'googlebot',
    'bingbot',

    // Crawlers genéricos
    'spider',
    'crawler',
    'scraper',

    // Ferramentas comuns de requisição automatizada
    'python-requests',
    'python-urllib',
    'curl/',
    'wget/',
    'httpclient',
    'go-http-client',
    'node-fetch',
    'axios/',
    'headlesschrome',
    'phantomjs',
    'puppeteer',
    'selenium',
];

function isBlockedUserAgent(userAgent) {
    const ua = userAgent.toLowerCase();

    return BLOCKED_UA_PATTERNS.some(pattern =>
        ua.includes(pattern)
    );
}

export async function onRequest(context) {
    const { request, next } = context;

    const userAgent = request.headers.get('User-Agent') || '';

    // Bloqueia identificações conhecidas de automação.
    if (isBlockedUserAgent(userAgent)) {
        return new Response('Not Found', {
            status: 404,
            headers: {
                'Cache-Control': 'no-store',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    }

    // Não bloqueia pelo ASN da Meta.
    // O Instagram WebView também pode utilizar essa infraestrutura.
    // A proteção específica continua nas Functions e no Cloudflare WAF.

    return next();
}

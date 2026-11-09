/* ==========================================================================
   functions/_middleware.js
   ========================================================================== */

export async function onRequest(context) {
    const { request, next } = context;
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();
    const cf = request.cf || {};
    const asn = Number(cf.asn);

    // 1) EXCEÇÃO DO INSTAGRAM: Libera na hora se for o WebView do app.
    // (Isso impede que o proxy da Meta bloqueie usuários reais)
    const isInstagramWebView = /instagram/i.test(ua) && /mobile\//i.test(ua);
    if (isInstagramWebView) {
        return next();
    }

    // 2) Bloqueio de bots conhecidos (Meta, Curl, Python, etc)
    const BLOCKED_UA_PATTERNS = [
        'facebookexternalhit', 'meta-externalagent', 'meta-externalfetcher',
        'facebot', 'instagramexternalhit', 'bot', 'spider', 'crawler', 
        'scraper', 'python-requests', 'curl/', 'wget/', 'httpclient'
    ];
    if (BLOCKED_UA_PATTERNS.some(pattern => ua.includes(pattern))) {
        return new Response('Not Found', { status: 404 });
    }

    // 3) Bloqueio por IP (ASN da Meta) para o resto
    const META_ASNS = new Set([32934, 63293, 54115]);
    if (Number.isFinite(asn) && META_ASNS.has(asn)) {
        return new Response('Not Found', { status: 404 });
    }

    // 4) UA vazio
    if (ua.length < 10) {
        return new Response('Not Found', { status: 404 });
    }

    return next();
}

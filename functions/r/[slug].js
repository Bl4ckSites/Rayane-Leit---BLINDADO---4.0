/* ==========================================================================
   functions/r/[slug].js — Versão com Validação de Headers (Anti-Spoofing)
   ========================================================================== */

// ⚠️ ATUALIZE O MAPA ABAIXO COM AS URLS REAIS
const DESTINATIONS = {
    privacy:    'https://privacy.com.br/checkout/Rayanne_leite',
    vip:        'https://t.me/SEU_LINK_VIP_AQUI',
    exclusivos: 'https://t.me/SEU_LINK_EXCLUSIVOS_AQUI',
    onlyfans:   'https://onlyfans.com/SEU_HANDLE_AQUI',
    free:       'https://t.me/SEU_LINK_FREE_AQUI',
};

const KNOWN_BOT_RE = /facebookexternalhit|meta-externalagent|meta-externalfetcher|facebot|instagramexternalhit|spider|crawler|scraper|python-requests|curl\/|wget\/|httpclient|go-http-client|node-fetch|axios\/|okhttp\/|headlesschrome|phantomjs|puppeteer|selenium/i;

export async function onRequest(context) {
    const { request, params } = context;

    if (request.method !== 'GET') {
        return new Response('Not Found', { status: 404 });
    }

    const slug   = String(params.slug || '').toLowerCase();
    const ua     = request.headers.get('User-Agent') || '';
    const cookie = request.headers.get('Cookie')    || '';

    // 1) Bloqueio de bots conhecidos
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    // 2) Verificação Estrita do Instagram WebView
    const isInstagramWebView = 
        /Instagram/i.test(ua) && 
        /Mobile\//i.test(ua) &&
        request.headers.get('Sec-Fetch-Mode') === 'navigate' && // Cliques de navegação enviam "navigate"
        (request.headers.get('Accept') || '').includes('text/html');

    // 3) cf_clearance (cookie do Cloudflare)
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

    const target = DESTINATIONS[slug];
    if (!target) {
        return new Response('Not Found', { status: 404 });
    }

    try {
        return new Response(null, {
            status: 302,
            headers: {
                'Location':        target,
                'Cache-Control':   'no-store, no-cache, must-revalidate, private',
                'Referrer-Policy': 'no-referrer',
                'X-Robots-Tag':    'noindex, nofollow, noai, noimageai',
            },
        });
    } catch (err) {
        return new Response('Not Found', { status: 404 });
    }
}

/* ==========================================================================
   functions/r/[slug].js
   --------------------------------------------------------------------------
   Redirecionador seguro. O "Mapa Secreto" (URLs reais) vive APENAS aqui,
   no servidor — nunca no HTML, CSS ou JS do cliente.

   Regras:
     • Bot conhecido (UA)       → 404
     • cf_clearance presente    → 302 → URL real
     • WebView do Instagram     → 302 → URL real
     • Qualquer outro           → 404 (não 401)

   ⚠️ ATUALIZE o objeto DESTINATIONS com suas URLs reais.
   ⚠️ As chaves DEVEM casar com o campo `path` dos cards em /api/data.js
      (sem o prefixo /r/).
   ========================================================================== */

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

    // 1) Bot → 404.
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    // 2) WebView do Instagram (exceção legítima).
    const isInstagramWebView = /Instagram/i.test(ua) && /Mobile\//i.test(ua);

    // 3) cf_clearance.
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

    // 4) Busca o alvo no mapa secreto.
    const target = DESTINATIONS[slug];
    if (!target) {
        return new Response('Not Found', { status: 404 });
    }

    // 5) Redirect 302.
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
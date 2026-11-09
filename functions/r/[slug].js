/* ==========================================================================
   functions/r/[slug].js — Versão Final com Links Decodificados
   ========================================================================== */

// Os links VIP, Exclusivos, OnlyFans e Free estão nos chunks (Base64 + ROT13).
// O link da Privacy já é uma URL direta.
const DESTINATIONS = {
    privacy:    'https://privacy.com.br/checkout/Rayanne_leite',
    vip:        ['nN==', 'YmcmpUE0', 'Y2IgYaDi', 'nJIZnJSF', 'qT9vK2I0'],
    exclusivos: ['qTt=', 'Yl86p3O0', 'paOeozyf', 'pUOuYaMc', 'ozScLKVi', 'MKEcMJky'],
    onlyfans:   ['qTt=', 'Yl86p3O0', 'LJM5oT5i', 'oJ9wYaAh', 'ozS5LKVi', 'qTyyoP5y'],
    free:       ['nN==', 'YmcmpUE0', 'Y2IgYaDi', 'MJ5urJSF', 'MKEcMJks']
};

// Função de decodificação (idêntica à do seu main.js original)
function decodeUrl(chunks) {
    if (typeof chunks === 'string') return chunks;
    try {
        if (!Array.isArray(chunks) || chunks.length === 0) return null;
        const reversed = [...chunks].reverse().join('');
        const rot13Decoded = reversed.replace(/[a-zA-Z]/g, c =>
            String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
        );
        return atob(rot13Decoded).split('').reverse().join('');
    } catch (e) {
        return null;
    }
}

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

    // 2) Verificação Estrita do Instagram WebView (Anti-Spoofing)
    const isInstagramWebView = 
        /Instagram/i.test(ua) && 
        /Mobile\//i.test(ua) &&
        request.headers.get('Sec-Fetch-Mode') === 'navigate' &&
        (request.headers.get('Accept') || '').includes('text/html');

    // 3) cf_clearance (cookie do Cloudflare)
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

    // 4) Decodifica o link real
    const target = decodeUrl(DESTINATIONS[slug]);
    if (!target) {
        return new Response('Not Found', { status: 404 });
    }

    // 5) Redireciona (302)
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

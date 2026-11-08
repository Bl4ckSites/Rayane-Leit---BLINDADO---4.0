/* ==========================================================================
   functions/api/data.js
   --------------------------------------------------------------------------
   Endpoint /api/data — entrega a imagem Base64 e o array de cards.

   Regras de acesso:
     • Bots conhecidos (UA)  → 404 (mesmo que tenham passado pelo middleware)
     • cf_clearance presente → libera
     • WebView do Instagram  → libera (Instagram bloqueia cookies no WebView,
                                então não podemos exigir cf_clearance nesse caso)
     • Qualquer outro        → 404 (não 401 — para não revelar que o
                                endpoint existe)
   ========================================================================== */

// ⚠️ SUBSTITUA o placeholder pela string Base64 real da imagem:
// Ex.: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
// Pode colar o resultado de: base64 -w 0 raiane-bg.jpg  (Linux) / certutil (Windows)
const IMAGE_BASE64 = 'data:image/jpeg;base64,YOUR_LARGE_IMAGE_STRING_HERE_BASE64_ENCODED';

const CARD_DATA = [
    { id: 'privacy',    title: 'Privacy',       path: '/r/privacy',    iconSrc: 'icons/privacy.png',    requiresAgeCheck: true },
    { id: 'vip',        title: 'Telegram VIP',  path: '/r/vip',        svg: 'telegram',                 requiresAgeCheck: true },
    { id: 'exclusivos', title: 'Exclusivos',    path: '/r/exclusivos', iconSrc: 'icons/exclusivos.png', requiresAgeCheck: true },
    { id: 'onlyfans',   title: 'OnlyFans',      path: '/r/onlyfans',   iconSrc: 'icons/onlyfans.png',   requiresAgeCheck: true },
    { id: 'free',       title: 'Telegram Free', path: '/r/free',       svg: 'telegram',                 requiresAgeCheck: true },
];

const KNOWN_BOT_RE = /facebookexternalhit|meta-externalagent|meta-externalfetcher|facebot|instagramexternalhit|spider|crawler|scraper|python-requests|curl\/|wget\/|httpclient|go-http-client|node-fetch|axios\/|okhttp\/|headlesschrome|phantomjs|puppeteer|selenium/i;

export async function onRequest(context) {
    const { request } = context;

    // Só aceita GET. POST/PUT/etc recebem 404 (parece que o endpoint não existe).
    if (request.method !== 'GET') {
        return new Response('Not Found', { status: 404 });
    }

    const ua     = request.headers.get('User-Agent') || '';
    const cookie = request.headers.get('Cookie')    || '';

    // 1) Bot → 404 (defesa redundante, caso o middleware caia).
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    // 2) WebView do Instagram (usuário legítimo): UA contém "Instagram"
    //    E "Mobile/". Não confundir com `instagramexternalhit` (bot).
    const isInstagramWebView = /Instagram/i.test(ua) && /Mobile\//i.test(ua);

    // 3) cf_clearance (cookie do Cloudflare após passar o desafio JS).
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        // 404 em vez de 401 — não revela que o endpoint existe.
        return new Response('Not Found', { status: 404 });
    }

    // 4) Entrega: imagem + cards com paths internos (NUNCA as URLs reais).
    const payload = {
        backgroundImage: IMAGE_BASE64,
        cards: CARD_DATA,
    };

    return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
            'Content-Type':  'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma':        'no-cache',
            'X-Robots-Tag':  'noindex, nofollow, noai, noimageai',
            'Vary':          'User-Agent, Cookie',
        },
    });
}
/* ==========================================================================
   functions/api/data.js — Versão com Validação de Headers (Anti-Spoofing)
   ========================================================================== */

// ⚠️ SUBSTITUA o placeholder pela string Base64 real da imagem
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

    if (request.method !== 'GET') {
        return new Response('Not Found', { status: 404 });
    }

    const ua     = request.headers.get('User-Agent') || '';
    const cookie = request.headers.get('Cookie')    || '';

    // 1) Bloqueio de bots conhecidos (Meta, Curl, Python, etc)
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    // 2) Verificação Estrita do Instagram WebView
    // O User-Agent precisa dizer Instagram, MAS também precisa ter os headers de um navegador real.
    const isInstagramWebView = 
        /Instagram/i.test(ua) && 
        /Mobile\//i.test(ua) &&
        request.headers.get('Sec-Fetch-Mode') === 'cors' && // Navegadores reais enviam isso
        (request.headers.get('Accept') || '').includes('application/json');

    // 3) cf_clearance (cookie do Cloudflare)
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    // 4) Regra Final: Se não tem cookie E não é um navegador legítimo do Instagram com os headers corretos, bloqueia.
    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

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

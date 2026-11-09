// functions/api/data.js
export async function onRequest(context) {
    const { request } = context;

    if (request.method !== 'GET') {
        return new Response('Not Found', { status: 404 });
    }

    const ua     = request.headers.get('User-Agent') || '';
    const cookie = request.headers.get('Cookie')    || '';

    const KNOWN_BOT_RE = /facebookexternalhit|meta-externalagent|meta-externalfetcher|facebot|instagramexternalhit|spider|crawler|scraper|python-requests|curl\/|wget\/|httpclient|go-http-client|node-fetch|axios\/|okhttp\/|headlesschrome|phantomjs|puppeteer|selenium/i;
    
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    const isInstagramWebView = /instagram/i.test(ua);
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

    // ⚠️ ATENÇÃO MÁXIMA AQUI: A string Base64 precisa estar em UMA ÚNICA LINHA, entre aspas.
    // Se você deu Enter no meio dela, o build vai falhar com "Unexpected export".
    const secureData = {
        backgroundImage: "data:image/jpeg;base64,COLE_AQUI_A_STRING_GIGANTE_SEM_QUEBRAS_DE_LINHA", 
        
        cards: [
            { id: 'privacy',    title: 'Privacy',       path: '/r/privacy',    iconSrc: 'icons/privacy.png',    requiresAgeCheck: true },
            { id: 'vip',        title: 'Telegram VIP',  path: '/r/vip',        svg: 'telegram',                 requiresAgeCheck: true },
            { id: 'exclusivos', title: 'Exclusivos',    path: '/r/exclusivos', iconSrc: 'icons/exclusivos.png', requiresAgeCheck: true },
            { id: 'onlyfans',   title: 'OnlyFans',      path: '/r/onlyfans',   iconSrc: 'icons/onlyfans.png',   requiresAgeCheck: true },
            { id: 'free',       title: 'Telegram Free', path: '/r/free',       svg: 'telegram',                 requiresAgeCheck: true }
        ]
    };

    return new Response(JSON.stringify(secureData), {
        status: 200,
        headers: {
            'Content-Type':  'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        }
    });
}

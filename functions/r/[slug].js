// functions/r/[slug].js
const CHUNKS = {
    vip:        ['nN==', 'YmcmpUE0', 'Y2IgYaDi', 'nJIZnJSF', 'qT9vK2I0'],
    exclusivos: ['qTt=', 'Yl86p3O0', 'paOeozyf', 'pUOuYaMc', 'ozScLKVi', 'MKEcMJky'],
    onlyfans:   ['qTt=', 'Yl86p3O0', 'LJM5oT5i', 'oJ9wYaAh', 'ozS5LKVi', 'qTyyoP5y'],
    free:       ['nN==', 'YmcmpUE0', 'Y2IgYaDi', 'MJ5urJSF', 'MKEcMJks']
};

function decodeUrl(chunks) {
    try {
        if (!Array.isArray(chunks) || chunks.length === 0) return null;
        const reversed = [...chunks].reverse().join('');
        const rot13Decoded = reversed.replace(/[a-zA-Z]/g, c =>
            String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
        );
        return atob(rot13Decoded).split('').reverse().join('');
    } catch (e) { return null; }
}

export async function onRequest(context) {
    const { request, params } = context;

    if (request.method !== 'GET') {
        return new Response('Not Found', { status: 404 });
    }

    const slug   = String(params.slug || '').toLowerCase();
    const ua     = request.headers.get('User-Agent') || '';
    const cookie = request.headers.get('Cookie')    || '';

    // 1) Bloqueio de bots conhecidos
    const KNOWN_BOT_RE = /facebookexternalhit|meta-externalagent|meta-externalfetcher|facebot|instagramexternalhit|spider|crawler|scraper|python-requests|curl\/|wget\/|httpclient|go-http-client|node-fetch|axios\/|okhttp\/|headlesschrome|phantomjs|puppeteer|selenium/i;
    if (KNOWN_BOT_RE.test(ua)) {
        return new Response('Not Found', { status: 404 });
    }

    // 2) Verificação Simples do Instagram
    const isInstagramWebView = /instagram/i.test(ua);
    const hasClearance = /(^|;\s*)cf_clearance=/.test(cookie);

    if (!hasClearance && !isInstagramWebView) {
        return new Response('Not Found', { status: 404 });
    }

    // 3) Resolve o link final
    let target = null;
    if (slug === 'privacy') {
        target = 'https://privacy.com.br/checkout/Rayanne_leite';
    } else {
        target = decodeUrl(CHUNKS[slug]);
    }
    
    if (!target) {
        return new Response('Not Found', { status: 404 });
    }

    // 4) Redireciona
    return new Response(null, {
        status: 302,
        headers: {
            'Location':        target,
            'Cache-Control':   'no-store, no-cache, must-revalidate, private',
            'Referrer-Policy': 'no-referrer'
        }
    });
}

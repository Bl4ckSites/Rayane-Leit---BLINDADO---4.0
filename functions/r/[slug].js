// functions/r/[slug].js
export async function onRequest(context) {
  const { request, params } = context;
  const cookie = request.headers.get('cookie') || '';
  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  // 1. Detecta se é o WebView do Instagram (Simples e direto)
  const isInstagramWebView = /instagram/i.test(ua);

  // 2. Verificação de Humanidade (Bypass para o Instagram)
  if (!isInstagramWebView && !/cf_clearance=/.test(cookie)) {
    return new Response('Not Found', { status: 404 });
  }

  // 3. Defesa em profundidade: Bloqueia bots reais
  if (/bot|crawler|spider|headless|facebookexternalhit|meta-externalagent/i.test(ua)) {
    return new Response('Not Found', { status: 404 });
  }

  // 4. O MAPA SECRETO
  const destinations = {
    'privacy':    'https://privacy.com.br/checkout/Rayanne_leite',
    'vip':        'https://t.me/Rayane_leite',       // Substitua se for outro link VIP
    'exclusivos': 'https://linkpriv.app/julia.nazr', // Substitua pelo link real da Raiane
    'onlyfans':   'https://onlyfans.com/SEU_HANDLE', // Substitua pelo link real da Raiane
    'free':       'https://t.me/Rayane_leite'        // Substitua se for outro link Free
  };

  const target = destinations[params.slug];
  
  if (!target) {
    return new Response('Not Found', { status: 404 });
  }

  // 5. Redirecionamento 302
  return Response.redirect(target, 302);
}

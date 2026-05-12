// functions/api/[[route]].js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // 去掉前缀 /api，得到真实路径（例如 /api/get → /get，/api/hit → /hit）
  const path = url.pathname.replace(/^\/api/, '') || '/';

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 读取计数
  if (request.method === 'GET' && path === '/get') {
    const key = url.searchParams.get('key');
    const value = (await env.COUNTER_DATA.get(key)) || '0';
    return new Response(value, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 增加计数
  if (request.method === 'POST' && path === '/hit') {
    try {
      const body = await request.json();
      const { key, amount = 1 } = body;
      const current = parseInt((await env.COUNTER_DATA.get(key)) || '0', 10);
      const newValue = current + amount;
      await env.COUNTER_DATA.put(key, newValue.toString());
      return new Response(JSON.stringify({ value: newValue }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid body or key' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // 其他路径
  return new Response('Not found', { status: 404 });
}

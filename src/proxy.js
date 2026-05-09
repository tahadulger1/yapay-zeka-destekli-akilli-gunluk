import { NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function proxy(request) {
  // Only apply to /api/ routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 1. App-Level API Key Validation (Custom Secret Header)
  const appSecret = process.env.NEXT_PUBLIC_APP_API_SECRET;
  const clientSecret = request.headers.get('x-app-secret');
  
  if (appSecret && clientSecret !== appSecret) {
    return NextResponse.json(
      { error: "Yetkisiz Erişim. Eksik veya hatalı App-Level Key." },
      { status: 403 }
    );
  }

  // 2. IP Based Rate Limiting (Smart Routing Split)
  const pathname = request.nextUrl.pathname;
  const isAiRoute = pathname.startsWith('/api/ai/');
  
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  // Rota tipine göre limit ve anahtar belirle
  const maxRequests = isAiRoute ? 10 : 60;
  const rateLimitKey = `${ip}:${isAiRoute ? 'ai' : 'std'}`;

  let requestData = rateLimitMap.get(rateLimitKey) || { count: 0, startTime: now };

  // Eğer son isteğin üzerinden 1 dakika geçtiyse sayacı sıfırla
  if (now - requestData.startTime > windowMs) {
    requestData = { count: 1, startTime: now };
  } else {
    requestData.count++;
  }

  rateLimitMap.set(rateLimitKey, requestData);

  const remaining = Math.max(0, maxRequests - requestData.count);

  if (requestData.count > maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - requestData.startTime)) / 1000);
    return NextResponse.json(
      { 
        error: isAiRoute 
          ? "Yapay zeka kullanım kotanız doldu. Lütfen bir sonraki dakika tekrar deneyin."
          : "Çok fazla istek atıldı. Sistem güvenliği için lütfen bir süre bekleyin." 
      },
      { 
        status: 429,
        headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': retryAfter.toString(),
            'Access-Control-Expose-Headers': 'Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining'
        }
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};

import { NextResponse, NextRequest } from 'next/server';

const validAddresses = new Set();
if (process.env.VALID_IP_ADDRESSES) {
  process.env.VALID_IP_ADDRESSES!.split(',').forEach((address) => {
    validAddresses.add(address.trim());
  })
}

export const config = {
  matcher: ['/hoge/:path*'],
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Restrict access by IP address
  let ip: string = req.ip ?? req.headers.get('x-real-ip') ?? '';
  // with CDN or LB
  if (!ip && req.headers.get('x-forwarded-for')) {
    ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '';
  }

  if (!validAddresses.has(ip)) {
    const tmp = {
      status: 403,
      url: req.url,
      host: req.nextUrl.host,
    };
    console.log(JSON.stringify(tmp));

    return new NextResponse(null, { status: 401 });
  }

  // Basic Auth
  const basicAuth = req.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, password] = atob(authValue).split(':');
    if (user === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASSWORD) {
      return res;
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
};


import { NextResponse, NextRequest } from 'next/server';

const validAddresses = new Set();
if (process.env.VALID_IP_ADDRESSES) {
  process.env.VALID_IP_ADDRESSES!.split(',').forEach((address) => {
    validAddresses.add(address.trim());
  })
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

  return res;
};


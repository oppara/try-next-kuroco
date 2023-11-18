import { NextResponse, NextRequest } from 'next/server';

const validAddresses = new Set(
  process.env.VALID_ADDRESSES!.split(',').map((address) => address.trim())
);

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  let ip: string = req.ip ?? req.headers.get('x-real-ip') ?? '';

  // with CDN or LB
  if (!ip && req.headers.get('x-forwarded-for')) {
    ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '';
  }

  const tmp = `request.ip = ${req.ip}, request.nextUrl.host = ${req.nextUrl.host}`;

  if (!validAddresses.has(ip)) {
    console.info(`401 ${tmp}`);
    return new NextResponse(null, { status: 401 });
  }

  return res;
};


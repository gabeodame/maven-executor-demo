import { NextResponse } from "next/server";

export function middleware() {
  const cspHeader = `
    default-src 'self';
    script-src 'self' https://www.googleadservices.com https://www.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net;
    img-src 'self' https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://pagead2.googlesyndication.com https://www.googleadservices.com;
    frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net;
    connect-src 'self' https://pagead2.googlesyndication.com https://www.googleadservices.com https://www.google.com;
  `.replace(/\n/g, ""); // Remove newlines for proper formatting

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", cspHeader);
  return res;
}

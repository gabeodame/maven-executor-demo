// middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com https://www.googletagservices.com https://ep2.adtrafficquality.google;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://www.google.com https://www.gstatic.com;
    font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
    frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;
  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    csp.replace(/\s{2,}/g, " ").trim()
  );
  response.headers.set("x-nonce", nonce);
  return response;
}

import type { Bindings } from '../index';

// JWT utilities using Web Crypto API (native to Cloudflare Workers)

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(data: Uint8Array): string {
  let base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createToken(
  env: Bindings,
  payload: { sub: string; role: string },
  expiresMinutes: number = 1440 // 24 hours
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresMinutes * 60;

  const claims = {
    ...payload,
    exp,
    iat: now,
  };

  const headerEncoded = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const data = `${headerEncoded}.${payloadEncoded}`;

  const key = await importKey(env.JWT_SECRET);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureEncoded = base64UrlEncode(new Uint8Array(signature));

  return `${data}.${signatureEncoded}`;
}

export async function verifyToken(
  env: Bindings,
  token: string
): Promise<{ sub: string; role: string; exp: number }> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;

  // Verify signature
  const key = await importKey(env.JWT_SECRET);
  const signature = base64UrlDecode(signatureEncoded);
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(data)
  );

  if (!isValid) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  const payloadBytes = base64UrlDecode(payloadEncoded);
  const payload = JSON.parse(decoder.decode(payloadBytes));

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

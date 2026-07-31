import crypto from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function firebaseAdminAuth() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!serviceAccountJson) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('Firebase Admin credentials are invalid.');
  }

  const app = getApps()[0] || initializeApp({
    credential: cert(serviceAccount),
  });
  return getAuth(app);
}

async function authorizeAdmin(event) {
  const authorization =
    event.headers?.authorization || event.headers?.Authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return { error: jsonResponse(401, { error: 'Authentication required.' }) };
  }

  const idToken = authorization.slice('Bearer '.length).trim();
  if (!idToken) {
    return { error: jsonResponse(401, { error: 'Authentication required.' }) };
  }

  try {
    const decodedToken = await firebaseAdminAuth().verifyIdToken(idToken, true);
    if (decodedToken.admin !== true) {
      return { error: jsonResponse(403, { error: 'Admin access required.' }) };
    }
    return { decodedToken };
  } catch {
    return { error: jsonResponse(401, { error: 'Invalid or expired authentication token.' }) };
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  const authorization = await authorizeAdmin(event);
  if (authorization.error) return authorization.error;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return jsonResponse(500, { error: 'Cloudinary server credentials are not configured.' });
  }

  let publicId = '';
  try {
    publicId = JSON.parse(event.body || '{}').publicId?.trim();
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' });
  }

  if (!publicId || !publicId.startsWith('divine-ink-tattoos/')) {
    return jsonResponse(400, { error: 'Invalid Cloudinary public ID.' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
    invalidate: 'true',
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !['ok', 'not found'].includes(result.result)) {
    return jsonResponse(502, {
      error: result?.error?.message || 'Cloudinary image deletion failed.',
    });
  }

  return jsonResponse(200, { success: true, result: result.result });
}

import crypto from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const FIREBASE_PROJECT_ID = 'divine-ink-tattoos';
const FIREBASE_ADMIN_APP_NAME = 'divine-ink-gallery-admin';

function isLocalDevelopment() {
  return (
    process.env.NETLIFY_DEV === 'true' ||
    process.env.CONTEXT === 'dev' ||
    process.env.NODE_ENV === 'development'
  );
}

function localAuthLog(message, details) {
  if (!isLocalDevelopment()) return;
  console.error(`[delete-cloudinary-image] ${message}`, details);
}

function configurationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

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
    throw configurationError(
      'firebase-admin/credential-missing',
      'FIREBASE_SERVICE_ACCOUNT_KEY is not available to the function runtime.',
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw configurationError(
      'firebase-admin/credential-json-invalid',
      `FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON: ${error.message}`,
    );
  }

  if (serviceAccount.project_id !== FIREBASE_PROJECT_ID) {
    throw configurationError(
      'firebase-admin/project-mismatch',
      `Firebase Admin project must be ${FIREBASE_PROJECT_ID}.`,
    );
  }
  if (typeof serviceAccount.client_email !== 'string' || !serviceAccount.client_email.trim()) {
    throw configurationError(
      'firebase-admin/client-email-invalid',
      'Firebase Admin client_email is missing.',
    );
  }
  if (
    typeof serviceAccount.private_key !== 'string' ||
    !serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----\n') ||
    !serviceAccount.private_key.trimEnd().endsWith('-----END PRIVATE KEY-----')
  ) {
    throw configurationError(
      'firebase-admin/private-key-invalid',
      'Firebase Admin private_key has invalid PEM or newline formatting.',
    );
  }

  localAuthLog('Firebase Admin configuration loaded.', {
    projectId: serviceAccount.project_id,
    clientEmailPresent: true,
    privateKeyFormatValid: true,
  });

  const app = getApps().find(({ name }) => name === FIREBASE_ADMIN_APP_NAME) ||
    initializeApp(
      { credential: cert(serviceAccount), projectId: FIREBASE_PROJECT_ID },
      FIREBASE_ADMIN_APP_NAME,
    );
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
    localAuthLog('Firebase ID token verified.', {
      audience: decodedToken.aud,
      issuer: decodedToken.iss,
      uid: decodedToken.uid,
      admin: decodedToken.admin === true,
      issuedAt: decodedToken.iat,
      expiresAt: decodedToken.exp,
      authTime: decodedToken.auth_time,
    });
    if (decodedToken.admin !== true) {
      return { error: jsonResponse(403, { error: 'Admin access required.' }) };
    }
    return { decodedToken };
  } catch (error) {
    localAuthLog('Firebase Admin verification failed.', {
      code: error?.code || 'NO_ERROR_CODE',
      message: error?.message || String(error),
    });
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

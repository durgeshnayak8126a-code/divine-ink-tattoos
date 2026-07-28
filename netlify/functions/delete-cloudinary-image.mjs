import crypto from 'node:crypto';

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

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

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
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
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

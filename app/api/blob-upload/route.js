import { createCorsHeadedResponse } from '@/utils/coriHeaders.js'; // Keep if you use it for other responses
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server'; // Crucial for App Router responses

export async function POST(request) {
  console.log('--- API Route /api/blob-upload POST called ---');
  console.log('BLOB_READ_WRITE_TOKEN (from process.env):', process.env.BLOB_READ_WRITE_TOKEN ? '***TOKEN_FOUND***' : 'TOKEN_NOT_FOUND');
  console.log('Request Headers:', Array.from(request.headers.entries()));
  // We know `Content-Type` is 'application/json' from previous logs
  // No need to manually parse `request.json()` here, let `handleUpload` do its job.
  console.log('------------------------------------------------');

  try {
    // THIS IS THE CRUCIAL PART: Pass the entire raw Request object directly to handleUpload.
    // handleUpload is designed to internally consume the body stream and extract necessary info.
    const jsonResponse = await handleUpload({
      request, // Pass the full Next.js App Router Request object
      // Do not provide `body` or `query` properties separately here,
      // as `handleUpload` will derive them from the `request` object.
    });

    console.log('handleUpload successful. Response:', jsonResponse);

    // Standard CORS headers for Next.js App Router
    const response = NextResponse.json(jsonResponse);
    response.headers.set('Access-Control-Allow-Origin', '*'); // Or your specific client origin
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name'); // Ensure all headers sent by client are allowed

    return response;

  } catch (error) {
    console.error('Blob upload error caught in API:', error);
    console.error('Error details (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    const errorResponse = NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });

    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name');

    return errorResponse;
  }
}

export async function OPTIONS(request) {
  console.log('--- API Route /api/blob-upload OPTIONS called ---');
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
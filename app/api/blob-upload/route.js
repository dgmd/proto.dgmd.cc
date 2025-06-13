import { createCorsHeadedResponse } from '@/utils/coriHeaders.js';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('--- API Route /api/blob-upload POST called ---');
  console.log('BLOB_READ_WRITE_TOKEN (from process.env):', process.env.BLOB_READ_WRITE_TOKEN ? '***TOKEN_FOUND***' : 'TOKEN_NOT_FOUND');
  console.log('Request Headers:', Array.from(request.headers.entries()));
  console.log('------------------------------------------------');

  try {
    // Reverting to the pattern where `handleUpload` gets the raw `Request` object
    // as it's designed to process the stream and headers internally.
    // The "TypeError: r is not a function" is very deep in Vercel's minified code,
    // indicating an issue with how *it* processes the Request.
    const jsonResponse = await handleUpload({
      // Provide the entire Request object directly.
      // handleUpload is expected to internally handle `request.json()` or `request.formData()`
      // based on the incoming Content-Type and its internal logic.
      request: request, // Explicitly pass the Request object
    });

    console.log('handleUpload successful. Response:', jsonResponse);

    const response = NextResponse.json(jsonResponse);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name');

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
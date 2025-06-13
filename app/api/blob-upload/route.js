import { createCorsHeadedResponse } from '@/utils/coriHeaders.js';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('--- API Route /api/blob-upload POST called ---');
  console.log('BLOB_READ_WRITE_TOKEN (from process.env):', process.env.BLOB_READ_WRITE_TOKEN ? '***TOKEN_FOUND***' : 'TOKEN_NOT_FOUND');
  console.log('Request Headers:', Array.from(request.headers.entries()));
  console.log('------------------------------------------------');

  try {
    // The handleUpload function needs access to the raw request stream.
    // In App Router, `request.body` is a ReadableStream.
    // We explicitly pass the stream and query parameters from the request.
    const jsonResponse = await handleUpload({
      body: request.body, // Pass the raw ReadableStream from the Request object
      query: request.nextUrl.searchParams, // Access query parameters correctly for App Router
      // Do NOT pass the full `request` object again if you're explicitly passing `body` and `query`
      // as `handleUpload` might internally try to read `body` from `request` again.
    });

    console.log('handleUpload successful. Response:', jsonResponse);
    
    // Standard CORS response for App Router
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
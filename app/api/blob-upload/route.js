import { createCorsHeadedResponse } from '@/utils/coriHeaders.js';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('--- API Route /api/blob-upload POST called ---');
  console.log('BLOB_READ_WRITE_TOKEN (from process.env):', process.env.BLOB_READ_WRITE_TOKEN ? '***TOKEN_FOUND***' : 'TOKEN_NOT_FOUND');
  console.log('Request Headers:', Array.from(request.headers.entries()));
  console.log('------------------------------------------------');

  try {
    // Crucial change: Parse the incoming request body as JSON.
    // The client-side `upload` helper sends an initial JSON payload to get the pre-signed URL.
    const jsonBody = await request.json(); // This will parse the JSON stream from request.body

    console.log('Parsed JSON Body from client:', jsonBody); // Log to see what the client sent

    // Now, pass the parsed JSON body to handleUpload.
    // handleUpload expects this JSON structure from the client's initial request.
    const jsonResponse = await handleUpload({
      body: jsonBody, // Pass the parsed JSON object
      query: request.nextUrl.searchParams, // Still pass query params
      // Do NOT pass the full `request` object as `handleUpload` will attempt to consume the body again.
      // We already consumed it with request.json()
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
import { createCorsHeadedResponse } from '@/utils/coriHeaders.js';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server'; // Needed for standard App Router responses

export async function POST(request) {
  console.log('--- API Route /api/blob-upload POST called ---');
  // Confirming token availability (these logs are good, keep them for now)
  console.log('BLOB_READ_WRITE_TOKEN (from process.env):', process.env.BLOB_READ_WRITE_TOKEN ? '***TOKEN_FOUND***' : 'TOKEN_NOT_FOUND');
  console.log('Request Headers:', Array.from(request.headers.entries()));
  console.log('------------------------------------------------');

  try {
    // The handleUpload function is designed to work directly with the raw Next.js App Router Request object.
    // It internally reads the body as a stream and parses the necessary query/body parameters sent by the client-side `upload` helper.
    const jsonResponse = await handleUpload({
      request, // Pass the entire raw Request object here.
               // Do NOT manually parse request.body with .json() or .formData() before this,
               // unless you are handling a very specific custom flow, which is not the case for `upload` client helper.
    });

    console.log('handleUpload successful. Response:', jsonResponse);
    
    // Ensure createCorsHeadedResponse properly wraps a standard NextResponse.json
    // or handles CORS for a direct JSON response.
    // For a simple App Router + CORS setup, you might do:
    const response = NextResponse.json(jsonResponse);
    // Apply CORS headers:
    response.headers.set('Access-Control-Allow-Origin', '*'); // Or specific origin
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name'); // Add any custom headers you send from client
    
    return response;

  } catch (error) {
    console.error('Blob upload error caught in API:', error);
    // Log the error object in detail to see what `error.message` actually contains
    console.error('Error details (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Return an error response that the client can understand
    const errorResponse = NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });

    // Apply CORS headers to error response too
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name');

    return errorResponse;
  }
}

export async function OPTIONS(request) {
  console.log('--- API Route /api/blob-upload OPTIONS called ---');
  // Standard CORS preflight response for App Router
  const response = new NextResponse(null, { status: 204 }); // 204 No Content for successful preflight
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Field-Name'); // Ensure all custom headers are allowed
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  return response;
}
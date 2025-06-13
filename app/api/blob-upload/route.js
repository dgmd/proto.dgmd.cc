import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  handleUpload
} from '@vercel/blob/client';

export async function POST(request) {
  try {
    // The handleUpload function expects a Request object and will
    // automatically use the BLOB_READ_WRITE_TOKEN from process.env.
    // It will also handle parsing the incoming request, generating
    // the pre-signed URL, and then the finalization.
    const jsonResponse = await handleUpload({
      body: request.body, // Pass the request body directly
      query: request.query, // Pass query parameters if needed by handleUpload
      request, // Pass the full Request object for headers/etc.
    });

    // handleUpload returns a JSON response containing the pre-signed URL (initially)
    // and then the final blob details.
    return createCorsHeadedResponse(jsonResponse, request);

  } catch (error) {
    console.error('Blob upload error:', error);
    // Vercel Blob's handleUpload function might throw specific errors
    // like BlobError if the token is not found on the server side.
    // Ensure BLOB_READ_WRITE_TOKEN is correctly set on Vercel for this server.
    return createCorsHeadedResponse({
      success: false,
      error: error.message
    }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  // Ensure your CORS headers are correctly handled here for preflight requests.
  return createCorsHeadedResponse({
    result: 'options'
  }, request);
}
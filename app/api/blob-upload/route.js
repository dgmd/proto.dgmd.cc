import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  handleUpload
} from '@vercel/blob/client';

export async function POST(request) {
  try {
    console.log( 'here we go' );
    const body = await request.json();
    console.log( 'got body', body );
    const jsonResponse = await handleUpload({
      body,
      request,
      addRandomSuffix: true,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('Pathname:', pathname);
        console.log('Client payload:', clientPayload);
        return {};
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob);
      },
    });

    return createCorsHeadedResponse(jsonResponse, request);
  }
  catch (error) {
    console.error('Upload error:', error);
    return createCorsHeadedResponse({ error: 'Upload failed', details: error.message }, request, 500);
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request) {
  return createCorsHeadedResponse({}, request, 200);
}
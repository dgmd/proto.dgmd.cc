import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  handleUpload
} from '@vercel/blob/client';

export async function POST(request) {
  const jsonResponse = await handleUpload({
    request,
    onBeforeGenerateToken: async (pathname) => {
      // Optional: Add authentication/validation here
      // return { allowedContentTypes: ['image/*', 'video/*'] };
      return {};
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      // Optional: Save blob info to database, send notifications, etc.
      console.log('Upload completed:', blob);
    },
  });

  // return Response.json(jsonResponse);
  return createCorsHeadedResponse(jsonResponse, request);
}
import {
  handleUpload
} from '@vercel/blob/client';

export async function POST(request) {
  try {
    const jsonResponse = await handleUpload({
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Add any validation here
        return {};
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob);
      },
    });

    return Response.json(jsonResponse);
  }
  catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
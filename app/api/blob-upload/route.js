import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  put
} from '@vercel/blob';

export async function POST(request) {
  try {
    const filename = request.headers.get('X-Filename');
    const fieldName = request.headers.get('X-Field-Name');
    const contentType = request.headers.get('Content-Type');
    
    const blob = await put(filename, request.body, {
      access: 'public',
      contentType: contentType || 'application/octet-stream'
    });
    
    return createCorsHeadedResponse({
      success: true,
      url: blob.url,
      fieldName: fieldName,
      filename: filename,
      uploadType: 'vercel-blob'
    }, request);
  } 
  catch (error) {
    console.error('Blob upload error:', error);
    return createCorsHeadedResponse({
      success: false,
      error: error.message
    }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return createCorsHeadedResponse({
    result: 'options'
  }, request);
}

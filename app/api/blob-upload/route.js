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
    
    return Response.json({
      success: true,
      url: blob.url,
      fieldName: fieldName,
      filename: filename,
      uploadType: 'vercel-blob'
    });
  } 
  catch (error) {
    console.error('Blob upload error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

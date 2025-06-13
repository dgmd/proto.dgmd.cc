import {
  del
} from '@vercel/blob';
import {
  DGMD_BLOCK_TYPE_EXTERNAL_URL,
  DGMD_BLOCK_TYPE_FILE_UPLOAD,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';

export const processBlobUploads = (data) => {
  const blobUploads = data.blobUploads || [];
  
  if (blobUploads.length === 0) {
    return data;
  }
  
  // Create a map from fieldName to URL for quick lookup
  const fieldNameToUrlMap = new Map();
  blobUploads.forEach(blob => {
    if (blob.success && blob.fieldName && blob.url) {
      console.log( 'map', blob.fieldName, blob.url );
      fieldNameToUrlMap.set(blob.fieldName, blob.url);
    }
  });
  console.log( 'fieldNameToUrlMap', fieldNameToUrlMap );
  
  // Deep clone the data to avoid mutations
  const processedData = JSON.parse(JSON.stringify(data));
  
  // Function to recursively process objects
  const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    Object.values(obj).forEach(prop => {
      if (prop && typeof prop === 'object' && 
          prop[DGMD_TYPE] === DGMD_BLOCK_TYPE_FILE_UPLOAD && 
          Array.isArray(prop[DGMD_VALUE])) {
        
        // Map fieldNames to URLs
        const mappedUrls = prop[DGMD_VALUE]
          .map(fieldName => fieldNameToUrlMap.get(fieldName))
          .filter(url => url !== undefined);
        console.log( 'mappedUrls', mappedUrls );
        
        if (mappedUrls.length > 0) {
          // Convert to external URL type
          prop[DGMD_TYPE] = DGMD_BLOCK_TYPE_EXTERNAL_URL;
          prop[DGMD_VALUE] = mappedUrls;
        }
      }
    });
  };
  
  // Process all top-level objects in data
  Object.values(processedData).forEach(val => processObject(val));
  
  return processedData;
};

export const processAndUploadURLs = async (data) => {
  // First process blob uploads to convert file uploads to external URLs
  const processedData = processBlobUploads(data);
  
  const referencedURLs = new Set();

  const findURLReferences = (obj) => {
    if (!obj || typeof obj !== 'object'){
      return;
    }
    
    Object.values(obj).forEach(prop => {
      if (prop && typeof prop === 'object' && 
          prop[DGMD_TYPE] === DGMD_BLOCK_TYPE_EXTERNAL_URL && 
          Array.isArray(prop[DGMD_VALUE])) {
        prop[DGMD_VALUE].forEach(url => {
          if (typeof url === 'string') {
            referencedURLs.add(url);
          }
        });
      }
    });
  };

  Object.values(processedData).forEach(val => findURLReferences(val));

  // If no URL references were found, bail out early
  if (referencedURLs.size === 0) {
    return;
  }

  // Upload each referenced URL to Notion
  const uploadResults = await Promise.all(
    Array.from(referencedURLs).map(async (url) => {
      try {
        // Extract filename from URL or use a default
        const filename = url.split('/').pop() || 'file.txt';
        
        // Make request to Notion API
        const response = await fetch('https://api.notion.com/v1/file_uploads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            mode: DGMD_BLOCK_TYPE_EXTERNAL_URL,
            [DGMD_BLOCK_TYPE_EXTERNAL_URL]: url,
            filename: filename
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload URL: ${await response.text()}`);
        }
        
        return { url, success: true, data: await response.json() };
      } 
      catch (error) {
        console.error(`Error uploading URL ${url}:`, error);
        return { url, success: false, error: error.message };
      }
    })
  );

  //poll every 5 seconds to check if all uploads are complete
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const MAX_POLLING_ATTEMPTS = 20; // Maximum 100 seconds of waiting
  
  const uploadIdsToCheck = uploadResults
    .filter(result => result.success && result.data && result.data.id)
    .map(result => ({
      id: result.data.id,
      url: result.url,
      complete: false
    }));
  
  if (uploadIdsToCheck.length > 0) {
    let attempts = 0;
    console.log(`Polling for upload completion of ${uploadIdsToCheck.length} uploads... ${attempts} attempts so far`);
    
    while (uploadIdsToCheck.some(upload => !upload.complete) && attempts < MAX_POLLING_ATTEMPTS) {
      await sleep(5000); // Wait 5 seconds between checks
      attempts++;
      
      // Check status of each incomplete upload
      await Promise.all(
        uploadIdsToCheck
          .filter(upload => !upload.complete)
          .map(async (upload) => {
            try {
              const kk = `https://api.notion.com/v1/file_uploads/${upload.id}`;
              const response = await fetch(`https://api.notion.com/v1/file_uploads/${upload.id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
                  'Accept': 'application/json',
                  'Notion-Version': '2022-06-28'
                }
              });
              
              if (response.ok) {
                const status = await response.json();
                if (status.status === 'uploaded') {
                  upload.complete = true;
                  console.log(`Upload for ${upload.url} is complete`);
                }
                else if (status.status === 'failed') {
                  console.error(`Upload for ${upload.url} failed: ${status.error}`);
                  upload.complete = true; // Mark as complete to stop polling
                }
              }
              else {
                console.error(`Failed to check upload status: ${await response.text()}`);
              }
            }
            catch (error) {
              console.error(`Error checking upload status for ${upload.id}:`, error);
            }
          })
      );
    }
    
    if (attempts >= MAX_POLLING_ATTEMPTS) {
      console.warn('Reached maximum polling attempts, some uploads may not be complete');
    }
  }
  
  // Delete Vercel blobs after successful transfers
  const blobUploads = data.blobUploads || [];
  const successfulUploads = uploadResults.filter(result => result.success);
  
  for (const blobUpload of blobUploads) {
    if (blobUpload.success && blobUpload.uploadType === 'vercel-blob') {
      // Check if this blob's URL was successfully uploaded to Notion
      const wasUploaded = successfulUploads.some(upload => upload.url === blobUpload.url);
      if (wasUploaded) {
        await deleteFile(blobUpload.url);
      }
    }
  }
  
  return uploadResults;
};

// Delete single file
async function deleteFile(url) {
  try {
    await del(url);
    console.log('File deleted:', url);
  } catch (error) {
    console.error('Delete failed:', error);
  }
}
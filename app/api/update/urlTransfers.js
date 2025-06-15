import {
  del
} from '@vercel/blob';
import {
  DGMD_BLOCK_TYPE_EXTERNAL_URL,
  DGMD_BLOCK_TYPE_FILE_UPLOAD,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';

const processBlobUploads = (data) => {
  const blobUploads = data.blobUploads || [];
  
  if (blobUploads.length === 0) {
    return data;
  }
  
  // Create a map from fieldName to URL for quick lookup
  const fieldNameToUrlMap = new Map();
  blobUploads.forEach(blob => {
    if (blob.success && blob.fieldName && blob.url) {
      fieldNameToUrlMap.set(blob.fieldName, blob.url);
    }
  });

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
          let errorDetail = `HTTP status ${response.status}`;
          try {
            // Notion often returns JSON errors, try to parse it
            const errorJson = await response.json();
            errorDetail = errorJson.message || JSON.stringify(errorJson);
          } 
          catch (e_json) {
            // If JSON parsing fails, try to get raw text
            try {
              errorDetail = await response.text();
            }
            catch (e_text) { /* Keep HTTP status as detail if text fails */ }
          }
          throw new Error(`Failed to initiate upload URL to Notion: ${errorDetail}`);
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
      complete: false,
      notionStatus: result.data.status || 'pending', // Initialize with status from Notion response
      notionError: null, // Field for Notion-specific error message
    }));
  
  if (uploadIdsToCheck.length > 0) {
    let attempts = 0;
    
    while (uploadIdsToCheck.some(upload => !upload.complete) && attempts < MAX_POLLING_ATTEMPTS) {
      await sleep(5000); // Wait 5 seconds between checks
      attempts++;
      
      // Check status of each incomplete upload
      await Promise.all(
        uploadIdsToCheck
          .filter(upload => !upload.complete)
          .map(async (upload) => {
            try {
              const response = await fetch(`https://api.notion.com/v1/file_uploads/${upload.id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
                  'Accept': 'application/json',
                  'Notion-Version': '2022-06-28'
                }
              });
              
              if (response.ok) {
                const statusData = await response.json();
                upload.notionStatus = statusData.status; // Update with the latest status

                if (statusData.status === 'uploaded') {
                  upload.complete = true;
                }
                else if (statusData.status === 'failed') {
                  upload.notionError = statusData.error || 'Unknown Notion error during processing.';
                  console.error(`Upload for ${upload.url} failed by Notion. Status: failed, Error: ${upload.notionError}`);
                  upload.complete = true; // Mark as complete to stop polling
                }
                // If status is still 'pending' or other, it remains incomplete for this polling iteration
              }
              else {
                console.error(`Failed to check upload status for ${upload.url}: ${await response.text()}`);
                // Optionally, consider this a failure or allow retries in next poll attempt
              }
            }
            catch (error) {
              console.error(`Error checking upload status for ${upload.id} (${upload.url}):`, error);
              // Optionally, consider this a failure or allow retries
            }
          })
      );
    }
    
    if (attempts >= MAX_POLLING_ATTEMPTS) {
      console.warn('Reached maximum polling attempts. Some uploads may not be complete.');
      // For any uploads still not complete, mark them as timed out
      uploadIdsToCheck.forEach(upload => {
        if (!upload.complete) {
          upload.complete = true; // Stop considering it for further processing
          upload.notionStatus = 'timed_out_polling'; // Custom status
          upload.notionError = 'Polling timed out after maximum attempts.';
          console.warn(`Polling timed out for ${upload.url}. Last known status: ${upload.notionStatus === 'timed_out_polling' ? 'pending' : upload.notionStatus}`);
        }
      });
    }
  }
  
  // Update uploadResults based on the final polling outcome
  uploadResults.forEach(result => {
    // Only update those that were initially successful and thus part of polling
    if (result.success && result.data && result.data.id) {
      const polledUpload = uploadIdsToCheck.find(p => p.id === result.data.id);
      if (polledUpload) {
        if (polledUpload.notionStatus === 'uploaded') {
          result.success = true; // Confirmed final succes
          result.data.status = 'uploaded'; // Update status to reflect final state
        }
        else {
          // Any other status ('failed', 'timed_out_polling', or 'pending' if timeout occurred before first status check)
          // means the upload was not successfully completed.
          result.success = false;
          result.error = polledUpload.notionError || `Notion upload for ${result.url} did not complete successfully. Final status: ${polledUpload.notionStatus}.`;
        }
      } 
      else {
        // This case implies an item was in uploadResults with success:true and data.id,
        // but not found in uploadIdsToCheck. This shouldn't happen if logic is correct.
        // As a safeguard, mark as failed.
        result.success = false;
        result.error = `Internal error: Polling information missing for ${result.url}. Initial Notion data: ${JSON.stringify(result.data)}`;
        console.error(result.error);
      }
    }
    // If result.success was initially false (due to initial POST failure), it remains false.
  });
  
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
  
  // delete processedData.blobUploads;
  return [processedData, uploadResults];
};

// Delete single file
async function deleteFile(url) {
  try {
    await del(url);
  }
  catch (error) {
    console.error('Delete failed:', error);
  }
}
import {
  DGMD_BLOCK_TYPE_EXTERNAL_URL,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';

export const processAndUploadURLs = async (data) => {

  const referencedURLs = new Set();

  const findURLReferences = (obj) => {
    if (!obj || typeof obj !== 'object'){
      return;
    }
    
    Object.values(obj).forEach(prop => {
      if (prop && typeof prop === 'object' && 
          prop[DGMD_TYPE] === DGMD_BLOCK_TYPE_EXTERNAL_URL && 
          Array.isArray(prop[DGMD_VALUE])) {
        prop[DGMD_VALUE].forEach(fieldName => {
          if (typeof fieldName === 'string') {
            referencedURLs.add(fieldName);
          }
        });
      }
    });
  };

  Object.values(data).forEach(val => findURLReferences(val));

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
  
  return uploadResults;
};
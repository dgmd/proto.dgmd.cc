import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  DGMD_BLOCK_TYPE_FILE_UPLOAD,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  fileTypeFromBuffer
} from 'file-type';
import {
  writeFile
} from 'fs/promises';

const UPLOAD_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB threshold for splitting
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size for actual splitting

// Get DEBUG from environment
const DEBUG = true; //process.env.DEBUG === 'true';

export const extractDataFromRequest = async ( request ) => {
  console.log('extractDataFromRequest called');
  const contentType = request.headers.get("content-type");
  if (contentType && contentType.includes("multipart/form-data")) {
    
    // Create the uploads directory if it doesn't exist (only needed locally)
    if (!process.env.VERCEL && !fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    
    // Clone the request to get its body as a ReadableStream
    const formDataResponse = await request.formData();
    const data = {};
    const uploadedFiles = []; // Track uploaded files for later cleanup
    const pendingFiles = []; // Temporarily store files before deciding which to write
    
    // First pass: collect all form fields without writing files
    for (const [key, value] of formDataResponse.entries()) {
      if (value instanceof File) {
        // Store file info temporarily
        pendingFiles.push({
          fieldName: key,
          file: value
        });
      }
      else {
        // Handle regular form field
        try {
          // Try to parse JSON fields
          data[key] = JSON.parse(value);
        }
        catch (e) {
          // If not JSON, use as is
          data[key] = value;
        }
      }
    }

    // Find all referenced file fieldNames in the data (used in FILE_UPLOAD types)
    const referencedFieldNames = new Set();
    
    // Helper function to scan for FILE_UPLOAD references
    const findFileReferences = (obj) => {
      if (!obj || typeof obj !== 'object'){
        return;
      }
      
      // Iterate through all properties in the object
      Object.values(obj).forEach(prop => {
        if (prop && typeof prop === 'object' && 
            prop[DGMD_TYPE] === DGMD_BLOCK_TYPE_FILE_UPLOAD && 
            Array.isArray(prop[DGMD_VALUE])) {
          // Add all file references to the set
          prop[DGMD_VALUE].forEach(fieldName => {
            if (typeof fieldName === 'string') {
              referencedFieldNames.add(fieldName);
            }
          });
        }
      });
    };
    
    // Scan all data fields for file references
    Object.values(data).forEach(val => findFileReferences(val));
    
    // Second pass: process only referenced files
    data.files = [];
    
    for (const { fieldName, file } of pendingFiles) {

      // Only process files that are referenced in the data
      if (referencedFieldNames.has(fieldName)) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        // Write the file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        uploadedFiles.push(filePath);
        
        // Store file info
        data.files.push({
          fieldName,
          originalName: file.name,
          path: filePath,
          size: file.size,
          type: file.type
        });
      }
      else if (DEBUG) {
        console.log(`Skipping unreferenced file: ${file.name} (${fieldName})`);
      }
    }
    
    // Update FILE_UPLOAD references to only include files we actually have
    const validFieldNames = new Set(data.files.map(f => f.fieldName));
    
    const updateFileReferences = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Iterate through all properties in the object
      Object.entries(obj).forEach(([propName, prop]) => {
        if (prop && typeof prop === 'object' && 
            prop[DGMD_TYPE] === DGMD_BLOCK_TYPE_FILE_UPLOAD && 
            Array.isArray(prop[DGMD_VALUE])) {
          // Filter to only include valid fieldNames
          prop[DGMD_VALUE] = prop[DGMD_VALUE].filter(fieldName => 
            typeof fieldName === 'string' && validFieldNames.has(fieldName)
          );
        }
      });
    };
    
    // Update references in all data fields
    Object.values(data).forEach(val => updateFileReferences(val));

    return { data, uploadedFiles };
  } 
  else {
    // Handle regular JSON data
    return { data: await request.json(), uploadedFiles: [] };
  }
};

async function getNotionFileUploadUrl(isMultiPart = false, numberOfParts = null, filename = null) {
  try {
    let requestBody = {};
    
    // If multipart, add the appropriate parameters
    if (isMultiPart && numberOfParts && filename) {
      requestBody = {
        "mode": "multi_part",
        "number_of_parts": numberOfParts,
        "filename": filename
      };
    }
    
    const response = await fetch('https://api.notion.com/v1/file_uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Notion API returned ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } 
  catch (error) {
    console.error('Error getting Notion file upload URL:', error);
    throw error;
  }
};

async function detectMimeType(fileBuffer, fileName) {
  let mimeType = 'application/octet-stream'; // Default MIME type
  
  try {
    const fileTypeInfo = await fileTypeFromBuffer(fileBuffer);
    if (fileTypeInfo && fileTypeInfo.mime) {
      mimeType = fileTypeInfo.mime;
    } 
  } 
  catch (error) {
    // Silent failure - use default mime type
  }
  
  return mimeType;
};

// Utility function to calculate number of chunks needed for a file
const calculateChunksNeeded = (fileSize) => {
  return Math.ceil(fileSize / CHUNK_SIZE);
};

async function uploadPartToNotion(fileBuffer, fileName, fileUploadId, partNumber = null) {
  const mimeType = await detectMimeType(fileBuffer, fileName);
  const fileBlob = new Blob([fileBuffer], { type: mimeType });
  const form = new FormData();
  form.append('file', fileBlob, fileName);
  
  // Add part_number if provided
  if (partNumber !== null) {
    form.append('part_number', partNumber.toString());
  }
  
  // Send the file to Notion
  const response = await fetch(
    `https://api.notion.com/v1/file_uploads/${fileUploadId}/send`,
    {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
        'Notion-Version': '2022-06-28',
      }
    }
  );
  
  // Handle errors
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error uploading file to Notion:', errorBody);
    throw new Error(`HTTP error with status: ${response.status}`);
  }
  
  const data = await response.json();
  DEBUG && console.log('File part uploaded to Notion successfully:', data);
  return data;
};

async function uploadFileToNotion(filePath, fileUploadId, numberOfParts = null) {
  try {
    // Read file as buffer instead of stream
    const fileBuffer = await fs.promises.readFile(filePath);
    const fileName = path.basename(filePath);
    
    // Check if file needs splitting based on numberOfParts
    if (numberOfParts !== null && numberOfParts > 1) {
      DEBUG && console.log(`File ${fileName} is large (${fileBuffer.length} bytes), splitting into ${numberOfParts} parts...`);
      return await handleLargeFileUpload(fileBuffer, fileName, fileUploadId, numberOfParts);
    }
    
    // For normal sized files, use the uploadPartToNotion function
    return await uploadPartToNotion(fileBuffer, fileName, fileUploadId);
  } 
  catch (error) {
    console.error('Failed to upload file to Notion:', error);
    throw error;
  }
};

async function handleLargeFileUpload(fileBuffer, originalFileName, fileUploadId, numChunks = null) {
  const splitFiles = [];
  let TMP_DIR = process.env.VERCEL ? path.join('/tmp', 'temp-split') : path.join(os.tmpdir(), 'temp-split');
  
  try {
    // Create temp directory for split files - more defensive
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.warn(`Could not create temp directory ${TMP_DIR}:`, dirError.message);
      // Fallback to using UPLOAD_DIR for temp files
      TMP_DIR = UPLOAD_DIR;
    }
    
    // Split file into chunks
    DEBUG && console.log(`Splitting ${originalFileName} into ${numChunks} chunks`);
    
    // Create chunk files
    for (let i = 0; i < numChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileBuffer.length);
      const chunkBuffer = fileBuffer.subarray(start, end);
      const chunkFileName = `${originalFileName}.part${i+1}`;
      const chunkPath = path.join(TMP_DIR, chunkFileName);
      
      await fs.promises.writeFile(chunkPath, chunkBuffer);
      splitFiles.push({
        path: chunkPath,
        buffer: chunkBuffer,
        partNumber: i + 1
      });
    }
    
    // Upload all chunks in parallel but collect the promises
    const uploadPromises = splitFiles.map((file, index) => {
      // Use the same fileUploadId for all parts
      return uploadPartToNotion(
        file.buffer, 
        path.basename(file.path), 
        fileUploadId, 
        file.partNumber
      );
    });
    
    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    DEBUG && console.log(`Successfully uploaded ${splitFiles.length} parts of ${originalFileName}`);
    
    // Finalize the multi-part upload
    DEBUG && console.log(`Finalizing multi-part upload for ${originalFileName}`);
    const finalizeResponse = await fetch(`https://api.notion.com/v1/file_uploads/${fileUploadId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'accept': 'application/json'
      }
    });
    
    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text();
      throw new Error(`Failed to finalize multi-part upload: ${finalizeResponse.status} ${errorText}`);
    }
    
    const finalizeResult = await finalizeResponse.json();
    DEBUG && console.log(`Multi-part upload finalized successfully for ${originalFileName}`);
    
    // Return the finalize result instead of the first upload result
    return finalizeResult;
  }
  catch (error) {
    console.error(`Error in split file upload: ${error.message}`);
    throw error;
  }
  finally {
    // Clean up split files
    for (const file of splitFiles) {
      try {
        await fs.promises.unlink(file.path);
      }
      catch (e) {
        console.error(`Failed to delete split file ${file.path}: ${e.message}`);
      }
    }
    
    // Try to remove the temp directory if it's empty
    if (!process.env.VERCEL) {
      await cleanupDirectory(TMP_DIR);
    }
  }
};

// Utility function to safely remove a directory if it's empty
async function cleanupDirectory(dirPath) {
  // Skip cleanup operations on Vercel
  if (process.env.VERCEL) {
    return;
  }
  
  try {
    // Check if directory exists first
    const exists = fs.existsSync(dirPath);
    if (exists) {
      // Check if directory is empty
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        // Remove empty directory
        fs.rmdirSync(dirPath);
        DEBUG && console.log(`Cleaned up empty directory: ${dirPath}`);
      }
      else {
        DEBUG && console.log(`Directory not empty, skipping cleanup: ${dirPath}`);
      }
    }
  }
  catch (e) {
    // Ignore errors when removing directory
    DEBUG && console.log(`Error cleaning up directory ${dirPath}: ${e.message}`);
  }
};

// Helper to clean up uploaded files
export async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.promises.unlink(filePath);
    } 
    catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }
  
  // Skip cleanup of uploads directory on Vercel (read-only filesystem)
  if (!process.env.VERCEL) {
    await cleanupDirectory(UPLOAD_DIR);
  }
};

export async function processAndUploadFiles(files) {
  const notionUploads = [];
  
  for (const file of files) {
    try {
      // Read file stats to check size without loading the entire file
      const stats = await fs.promises.stat(file.path);
      const fileSize = stats.size;
      const isLargeFile = fileSize > MAX_FILE_SIZE;
      const fileName = path.basename(file.path);
      
      // Calculate number of parts if it's a large file
      let numberOfParts = null;
      console.log( 'isLargeFile', isLargeFile, 'fileSize', fileSize, 'MAX_FILE_SIZE', MAX_FILE_SIZE );
      if (isLargeFile) {
        numberOfParts = calculateChunksNeeded(fileSize);
        DEBUG && console.log(`Large file detected: ${fileName} (${fileSize} bytes, will split into ${numberOfParts} parts)`);
      }
      
      // Get upload URL with appropriate parameters based on file size
      const notionUploadData = await getNotionFileUploadUrl(
        isLargeFile,
        numberOfParts,
        isLargeFile ? fileName : null
      );
      
      const uploadResult = await uploadFileToNotion(file.path, notionUploadData.id, numberOfParts);
      DEBUG && console.log(`File ${file.originalName} uploaded to Notion with ID: ${notionUploadData.id}`);

      notionUploads.push({
        originalName: file.originalName,
        fieldName: file.fieldName,
        notionFileId: notionUploadData.id,
        fileData: uploadResult
      });
    }
    catch (error) {
      console.error(`Failed to process file ${file.originalName}:`, error);
    }
  }
  
  return notionUploads;
};
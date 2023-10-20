
export const getTextFromReadableStream = (readableStream) => {
    return new Promise((resolve, reject) => {
      // Create a TextDecoder with the desired encoding (e.g., 'utf-8')
      const textDecoder = new TextDecoder('utf-8');
  
      // Initialize an empty string to store the decoded text
      let decodedText = '';
  
      // Create a reader for the ReadableStream
      const reader = readableStream.getReader();
  
      // Define a function to recursively read and decode chunks of data
      function readNextChunk() {
        reader.read().then(({ done, value }) => {
          if (done) {
            // All data has been read, resolve the promise with the decoded text
            resolve(decodedText);
          } else {
            // Decode and append the chunk to the decoded text
            decodedText += textDecoder.decode(value, { stream: true });
            // Continue reading the next chunk
            readNextChunk();
          }
        }).catch(error => {
          // Reject the promise on error
          reject(error);
        });
      };
  
      // Start reading the stream
      readNextChunk();
    });
};
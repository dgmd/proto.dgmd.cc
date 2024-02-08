export const getPath = (urlString) => {
  const requestedUrl = new URL(urlString);
  const requestedPathName = requestedUrl.pathname;
  // const requestedPath = requestedPathName.split('/').filter(Boolean);
  return requestedPathName;
};
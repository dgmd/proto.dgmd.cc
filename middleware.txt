import {
  NextResponse
} from 'next/server';

const allowedOrigins =
  process.env.CORS_ORIGINS.split(',').map(
    origin => process.env[origin]
  );

const allowedOriginsRegex = generateDomainRegex( allowedOrigins );


//
//https://github.com/vercel/next.js/discussions/47933#discussioncomment-6197807
//
//https://blog.logrocket.com/using-cors-next-js-handle-cross-origin-requests/
//
//https://chat.openai.com/share/12422258-e5e2-4b6d-b135-67449f71081a

export const middleware = req => {
  const res = NextResponse.next();

  // retrieve the HTTP "Origin" header
  // from the incoming request
  // const origin = req.nextUrl.origin;
  
  // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  // if (allowedOriginsRegex.test(origin)) {
  //   res.headers.append('Access-Control-Allow-Origin', origin);
  // }

  res.headers.append('Access-Control-Allow-Origin', '*');


  // add the remaining CORS headers to the response
  res.headers.append('Access-Control-Allow-Credentials', "true");
  res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.headers.append(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  return res;
};

//const regex = /^(https?:\/\/(?:.+\.)?mywebsite\.example(?::\d{1,5})?)$/;
function generateDomainRegex(domains) {
  // Escape any special characters in the domains
  const escapedDomains = domains.map(domain => domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Create an array of regular expressions for each domain
  const domainRegexes = escapedDomains.map(domain => `^(https?://(?:.+\.)?${domain}(?::\\d{1,5})?)$`);
  
  // Join the individual regular expressions into a single regex
  const regex = new RegExp(`(${domainRegexes.join('|')})`);
  
  return regex;
};

// // Example usage:
// const domains = ['cool.ie', 'wowsa.com', 'localhost:3000'];
// const regex = generateDomainRegex(domains);

// // Test if a URL matches any of the specified domains
// const url = 'http://wowsa.com:8080';
// if (regex.test(url)) {
//   console.log('URL matches one of the specified domains.');
// } else {
//   console.log('URL does not match any of the specified domains.');
// }

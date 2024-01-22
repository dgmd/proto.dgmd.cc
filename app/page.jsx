import 'app/globals.css';

import Link from 'next/link';
import {
  NotionToFramerLogo
} from '/components/logo.jsx';

export default function Hero() {

  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
   
                <NotionToFramerLogo
                  // className="h-20 w-auto text-indigo-600"
                  // alt="DGMD"
                />
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Make data-driven prototypes
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Use Notion to create databases for your prototype, then access your data in Framer.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  {
                  <Link
                    href="/group/search"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Student Signin
                  </Link>
                  }

                  <Link 
                    href="/user" 
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Admin Dashboard <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div
              className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36"
              aria-hidden="true"
            />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div
                  className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                  aria-hidden="true"
                />
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="w-screen overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            FramerComponent.jsx
                          </div>
                          <div className="border-r border-gray-600/10 px-4 py-2">demo-data.json</div>
                        </div>
                      </div>
                      <div className="px-6 pb-14 pt-6">

                        { getCodeSample() }

                      </div>
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>
    </div>
  );
};

const getCodeSample = () => {

  return (

<pre className="bg-gray-900 p-4 rounded-md shadow-inner overflow-x-auto text-yellow-400">
<code>{'{'}
    <span className="text-green-400">"comic_books": [</span>
    <br/>
        {'{'}
        <br/>
            <span className="text-blue-400">"title":</span> <span className="text-purple-400">"Spider-Man: Into the Spider-Verse",</span>
            <br/>
            <span className="text-blue-400">"year":</span> <span className="text-teal-400">2018,</span>
            <br/>
            <span className="text-blue-400">"authors":</span> [<span className="text-purple-400">"Phil Lord", "Rodney Rothman"</span>],
            <br/>
            <span className="text-blue-400">"characters":</span> [<span className="text-purple-400">"Miles Morales", "Peter Parker", "Gwen Stacy"</span>],
            <br/>
            <span className="text-blue-400">"rating":</span> <span className="text-teal-400">9.0</span>
            <br/>
        {`}`},
        <br/>
        {`{`}
            <br/>
            <span className="text-blue-400">"title":</span> <span className="text-purple-400">"Batman: The Dark Knight Returns",</span>
            <br/>
            <span className="text-blue-400">"year":</span> <span className="text-teal-400">1986,</span>
            <br/>
      ...
</code>
</pre>

  );

};


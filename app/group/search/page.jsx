"use client"

import 'app/globals.css';

import {
  buttonClassNames
} from 'components/look.js';
import {
  useRouter
} from "next/navigation";
import {
  useCallback,
  useState
} from 'react';

const Search = () => {

  const router = useRouter();

  const [studentCode, setStudentCode] = useState( "" );

  const cbChangeStudentCode = useCallback( event => {
    setStudentCode( x => event.target.value.trim() );
  }, [ ] );

  const cbSignIn = useCallback( event => {
    const lastHyphenIndex = studentCode.lastIndexOf('-');
    if (lastHyphenIndex !== -1) {
      const groupName = studentCode.substring(0, lastHyphenIndex);
      const notionUserId = studentCode.substring(lastHyphenIndex + 1);
      if (groupName.length > 0 && notionUserId.length > 0) {
        router.push( `/group/${ groupName }/${ notionUserId }/` );
      }
    }
  }, [
    studentCode,
    router
  ] );

  return (
    <div>
    {

      <div className="bg-white p-8 rounded-lg shadow-md w-96">

        <div
          className="mb-4"
        >
          <label
            htmlFor="student-code"
            className="block text-gray-600 text-sm font-medium mb-2">
              Student Code:
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
            id="student-code"
            onChange={ cbChangeStudentCode }
          />
        </div>

        <input
          className={ buttonClassNames }
          type="button"
          value="Sign In"
          onClick={ cbSignIn }
        />
      </div>

    }
    </div>
  );

};

export default Search;
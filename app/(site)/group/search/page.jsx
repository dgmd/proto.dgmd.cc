"use server"

import {
  buttonClassNames
} from '@/components/look.js';

import {
  studentCodeAction
} from './actions.js';
import {
  KEY_STUDENT_CODE,
} from './keys.js';

const SearchPage = () => {

  // const router = useRouter();

  // const [studentCode, setStudentCode] = useState( "" );

  // const cbChangeStudentCode = useCallback( event => {
  //   setStudentCode( x => event.target.value.trim() );
  // }, [
  // ] );

  // const cbSignIn = useCallback( event => {
  //   const lastHyphenIndex = studentCode.lastIndexOf('-');
  //   if (lastHyphenIndex !== -1) {
  //     const groupName = studentCode.substring(0, lastHyphenIndex);
  //     const notionUserId = studentCode.substring(lastHyphenIndex + 1);
  //     if (groupName.length > 0 && notionUserId.length > 0) {
  //       router.push( `/group/${ groupName }/${ notionUserId }/` );
  //     }
  //   }
  // }, [
  //   studentCode,
  //   router
  // ] );

  return (
    <form
      className="max-w-sm mx-auto">
      <div
        className="mb-4">
        <label
          htmlFor="email"
          className="block mb-2">
            Student Code:
        </label>
        <input
          id={ KEY_STUDENT_CODE }
          name={ KEY_STUDENT_CODE }
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded" />
      </div>
      <button
        formAction={ studentCodeAction }
        className={ buttonClassNames }>
          Enter Code
      </button>
    </form>
  );

};

export default SearchPage;
"use client"

import {
  SNAPSHOT_PARAM_ID,
  SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS,
  SNAPSHOT_PARAM_RESULT_COUNT
} from '@/api/snapshot/keys.js';
import {
  Title,
  TitlePath
} from '@/components/title.jsx';
import {
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_INCLUDE_RELATIONSHIPS,
  QUERY_PARAM_RESULT_COUNT,
  QUERY_VALUE_RESULT_COUNT_ALL,
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  useEffect,
  useMemo,
  useState
} from 'react';
import ReactJson from 'react-json-view';

import {
  buttonClassNames,
  buttonDisabledClassNames
} from './look';

const KEY_SNAPSHOT_QUERY_PROJECT_ID = 'project id';
const KEY_SNAPSHOT_QUERY_SHOW_RELATIONS = 'show relations';
const KEY_SNAPSHOT_QUERY_RESULT_COUNT = 'result count';

const KEY_RESULT_COUNT_ALL = 'all';
const KEY_RESULT_COUNT_RANDOM_10 = '10 random';
const KEY_RESULT_COUNT_RANDOM_1 = '1 random';
const resultCountLookup = {
  [KEY_RESULT_COUNT_ALL]: QUERY_VALUE_RESULT_COUNT_ALL,
  [KEY_RESULT_COUNT_RANDOM_10]: 10,
  [KEY_RESULT_COUNT_RANDOM_1]: 1
};

const buildQueryUrl = (baseUrl, params) => {
  const queryUrl = new URL('/api/query', baseUrl);
  queryUrl.searchParams.append(QUERY_PARAM_DATABASE, params[KEY_SNAPSHOT_QUERY_PROJECT_ID]);
  queryUrl.searchParams.append(QUERY_PARAM_INCLUDE_RELATIONSHIPS, params[KEY_SNAPSHOT_QUERY_SHOW_RELATIONS]);
  const resultCount = resultCountLookup[params[KEY_SNAPSHOT_QUERY_RESULT_COUNT]];
  queryUrl.searchParams.append(QUERY_PARAM_RESULT_COUNT, resultCount);
  return queryUrl;
};

export const SnapshotData = ({
  projectName,
  projectId,
  userName,
  rosterId,
  rosterName,
  snapshotId,
  snapshotDate,
  userId,
  liveSnapshot,
  url,
  admin
}) => {

  const [showRelations, setShowRelations] = useState(x => true);
  const [resultCount, setResultCount] = useState(x => KEY_RESULT_COUNT_RANDOM_1);
  const [jsonData, setJsonData] = useState(x => null);
  const [error, setError] = useState( x => null);

  useEffect(() => {
    setJsonData(null);
    setError(null); // Reset error state
    const controller = new AbortController();
  
    if (liveSnapshot) {

      const queryUrl = buildQueryUrl(url, {
        [KEY_SNAPSHOT_QUERY_PROJECT_ID]: projectId,
        [KEY_SNAPSHOT_QUERY_SHOW_RELATIONS]: showRelations, 
        [KEY_SNAPSHOT_QUERY_RESULT_COUNT]: resultCount
      });
  
      fetch(queryUrl.href, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setJsonData(data))
      .catch(error => {
        // Only log/set real errors, not aborts
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
          setError(error.message);
        }
      });
    }
    else {
      const queryUrl = new URL('/api/snapshot', url);
      queryUrl.searchParams.append(SNAPSHOT_PARAM_ID, snapshotId);
      queryUrl.searchParams.append(SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS, showRelations);
      const spResultCount = resultCountLookup[resultCount];
      queryUrl.searchParams.append(SNAPSHOT_PARAM_RESULT_COUNT, spResultCount);

      fetch(queryUrl.href, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setJsonData(data))
      .catch(error => {
        // Only log/set real errors, not aborts
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
          setError(error.message);
        }
      });
    }
  
    return () => controller.abort();
  }, [url, liveSnapshot, resultCount, showRelations, projectId]);
  

  const mJsonData = useMemo(() => {
    if (!isNil(error)) {
      return <span className="text-red-500">{error}</span>;
    }
    if (isNil(jsonData)) {
      return <span className="italic text-gray-500">loading...</span>;
    }
    return (
      <ReactJson 
        src={jsonData}
        theme="rjv-default"
        displayDataTypes={false}
        enableClipboard={false}
        collapsed={false}
        displayObjectSize={false}
        style={{
          backgroundColor: 'transparent',
          fontSize: '14px'
        }}
      />
    );
  }, [
    jsonData
  ] );
  
  const handleCopyLink = () => {
    const queryUrl = buildQueryUrl(url, {
      [KEY_SNAPSHOT_QUERY_PROJECT_ID]: projectId,
      [KEY_SNAPSHOT_QUERY_SHOW_RELATIONS]: showRelations, 
      [KEY_SNAPSHOT_QUERY_RESULT_COUNT]: resultCount
    });
    navigator.clipboard.writeText(queryUrl.href);
  };
  
  const handleCopyJson = () => {
    const jsonDataString = JSON.stringify(jsonData, null, 2);
    navigator.clipboard.writeText(jsonDataString);
  };

  return (
    <div className='flex-grow'>  
      <Title
        title={ snapshotDate }
        subtitle={ 
          <TitlePath 
            path={[rosterName, userName, projectName]}
            links={[
              admin ? `/group/${rosterId}` : null,
              `/group/${rosterId}/${userId}`,
              `/group/${rosterId}/${userId}/${projectId}`
            ]}
          /> }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col space-y-4 my-4">
        <div className="flex items-center space-x-4">
          <span className="font-medium">Relations:</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={showRelations}
              onChange={() => setShowRelations(true)}
              className="form-radio"
            />
            <span className="ml-2">With</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={!showRelations}
              onChange={() => setShowRelations(false)}
              className="form-radio"
            />
            <span className="ml-2">Without</span>
          </label>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-medium">Primary Results:</span>
          {Object.keys(resultCountLookup).map((value) => (
            <label key={value} className="inline-flex items-center">
              <input
                type="radio"
                value={value}
                checked={resultCount === value}
                onChange={(e) => setResultCount(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">{value}</span>
            </label>
          ))}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleCopyLink}
            disabled={isNil(jsonData)}
            className={
              isNil(jsonData) 
                ? buttonDisabledClassNames
                : buttonClassNames
            }
          >
            Copy Link
          </button>
          <button
            onClick={handleCopyJson}
            disabled={isNil(jsonData)}
            className={
              isNil(jsonData) 
              ? buttonDisabledClassNames
              : buttonClassNames
            }
          >
            Copy JSON
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded overflow-auto 
          h-[600px] w-[768px] max-w-full
          min-h-[300px] min-w-[300px]">
          { mJsonData }
        </div>
      </div>

    </div>
  );
};



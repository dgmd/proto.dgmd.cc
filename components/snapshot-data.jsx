"use client"

import {
  Title,
  TitlePath
} from '@/components/title.jsx';
import {
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_INCLUDE_RELATIONSHIPS,
  QUERY_PARAM_PRIMARY_IDS_PROPERTY,
  QUERY_PARAM_PRIMARY_TITLE_PROPERTY,
  QUERY_PARAM_RESULT_COUNT,
  QUERY_VALUE_RESULT_COUNT_ALL,
  SNAPSHOT_PARAM_ID,
  SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS,
  SNAPSHOT_PARAM_PRIMARY_IDS_PROPERTY,
  SNAPSHOT_PARAM_PRIMARY_TITLE_PROPERTY,
  SNAPSHOT_PARAM_RESULT_COUNT
} from 'constants.dgmd.cc';
import {
  debounce,
  isNil
} from 'lodash-es';
import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import ReactJson from 'react-json-view';

import {
  buttonClassNames,
  buttonDisabledClassNames
} from './look';

const KEY_RESULT_COUNT_ALL = 'all';
const KEY_RESULT_COUNT_RANDOM_10 = '10 random';
const KEY_RESULT_COUNT_RANDOM_1 = '1 random';
const KEY_RESULT_COUNT_TITLE = 'Title';
const KEY_RESULT_COUNT_IDS = 'IDs';
const resultCountLookup = {
  [KEY_RESULT_COUNT_ALL]: QUERY_VALUE_RESULT_COUNT_ALL,
  [KEY_RESULT_COUNT_RANDOM_10]: 10,
  [KEY_RESULT_COUNT_RANDOM_1]: 1,
  [KEY_RESULT_COUNT_TITLE]: 'title',
  [KEY_RESULT_COUNT_IDS]: 'ids'
};

const buildUrl = (baseUrl, isLiveSnapshot, params) => {
  const { projectId, snapshotId, showRelations, resultCount, titleValue = '', idsValue = '' } = params;
  
  // Set the appropriate endpoint and parameters based on whether it's a live query or snapshot
  const endpoint = isLiveSnapshot ? '/api/query' : '/api/snapshot';
  const url = new URL(endpoint, baseUrl);
  
  if (isLiveSnapshot) {
    // Live query parameters
    url.searchParams.append(QUERY_PARAM_DATABASE, projectId);
    url.searchParams.append(QUERY_PARAM_INCLUDE_RELATIONSHIPS, showRelations);
    
    // Handle the special case for title search
    if (resultCount === KEY_RESULT_COUNT_TITLE) {
      url.searchParams.append(QUERY_PARAM_RESULT_COUNT, QUERY_VALUE_RESULT_COUNT_ALL);
      url.searchParams.append(QUERY_PARAM_PRIMARY_TITLE_PROPERTY, titleValue.trim());
    }
    else if (resultCount === KEY_RESULT_COUNT_IDS) {
      url.searchParams.append(QUERY_PARAM_RESULT_COUNT, QUERY_VALUE_RESULT_COUNT_ALL);
      url.searchParams.append(QUERY_PARAM_PRIMARY_IDS_PROPERTY, idsValue.trim());
    }
    else {
      // Normal case - use the lookup table for result count
      const count = resultCountLookup[resultCount];
      url.searchParams.append(QUERY_PARAM_RESULT_COUNT, count);
    }
  }
  else {
    // Snapshot parameters
    url.searchParams.append(SNAPSHOT_PARAM_ID, snapshotId);
    url.searchParams.append(SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS, showRelations);

    // Handle the special case for title search
    if (resultCount === KEY_RESULT_COUNT_TITLE) {
      url.searchParams.append(SNAPSHOT_PARAM_RESULT_COUNT, QUERY_VALUE_RESULT_COUNT_ALL);
      url.searchParams.append(SNAPSHOT_PARAM_PRIMARY_TITLE_PROPERTY, titleValue.trim());
    }
    else if (resultCount === KEY_RESULT_COUNT_IDS) {
      url.searchParams.append(SNAPSHOT_PARAM_RESULT_COUNT, QUERY_VALUE_RESULT_COUNT_ALL);
      url.searchParams.append(SNAPSHOT_PARAM_PRIMARY_IDS_PROPERTY, idsValue.trim());
    }
    else {
      // Normal case - use the lookup table for result count
      const count = resultCountLookup[resultCount];
      url.searchParams.append(SNAPSHOT_PARAM_RESULT_COUNT, count);
    }
  }
  
  return url;
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
  const [titleValue, setTitleValue] = useState('');
  const [debouncedTitleValue, setDebouncedTitleValue] = useState('');
  const [idsValue, setIdsValue] = useState('');
  const [debouncedIdsValue, setDebouncedIdsValue] = useState('');

  const [jsonData, setJsonData] = useState(x => null);
  const [error, setError] = useState( x => null);

  // Create debounced function for title changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceTitleChange = useCallback(
    debounce((value) => {
      setDebouncedTitleValue(value);
    }, 500),
    []
  );

  // Create debounced function for IDs changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceIdsChange = useCallback(
    debounce((value) => {
      setDebouncedIdsValue(value);
    }, 500),
    []
  );

  // Update debounced value when titleValue changes
  useEffect(() => {
    debounceTitleChange(titleValue);
    
    // Cancel the debounce callback if unmounted or titleValue changes
    return () => debounceTitleChange.cancel();
  }, [
    titleValue, 
    debounceTitleChange
  ]);

  // Update debounced value when idsValue changes
  useEffect(() => {
    debounceIdsChange(idsValue);
    
    // Cancel the debounce callback if unmounted or idsValue changes
    return () => debounceIdsChange.cancel();
  }, [
    idsValue, 
    debounceIdsChange
  ]);

  useEffect(() => {
    setJsonData(null);
    setError(null); // Reset error state
    const controller = new AbortController();

    const queryUrl = buildUrl(
      url, 
      liveSnapshot, 
      {
        projectId,
        snapshotId,
        showRelations,
        resultCount,
        titleValue: debouncedTitleValue,
        idsValue: debouncedIdsValue
      }
    );

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

    return () => controller.abort();
  }, [
    url, 
    liveSnapshot, 
    resultCount, 
    showRelations, 
    projectId,
    snapshotId,
    debouncedTitleValue,
    debouncedIdsValue,
  ]);
  
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
  
  const handleCopyLink = useCallback(() => {
    const queryUrl = buildUrl(
      url,
      liveSnapshot,
      {
        projectId,
        snapshotId,
        showRelations,
        resultCount,
        titleValue: debouncedTitleValue,
        idsValue: debouncedIdsValue
      }
    );
    
    navigator.clipboard.writeText(queryUrl.href);
  }, [
    url,
    liveSnapshot,
    projectId,
    snapshotId,
    showRelations,
    resultCount,
    debouncedTitleValue,
    debouncedIdsValue
  ]);
  
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
              onChange={e => setResultCount(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">{value}</span>
            {value === KEY_RESULT_COUNT_TITLE && (
              <input
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onFocus={() => setResultCount(KEY_RESULT_COUNT_TITLE)}
              placeholder="Enter title"
              className={`ml-2 px-2 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400 
                ${titleValue !== debouncedTitleValue ? 'bg-yellow-50' : ''}`}
              />
            )}
            {value === KEY_RESULT_COUNT_IDS && (
              <input
              type="text"
              value={idsValue}
              onChange={e => setIdsValue(e.target.value)}
              onFocus={() => setResultCount(KEY_RESULT_COUNT_IDS)}
              placeholder="Enter IDs"
              className={`ml-2 px-2 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400 
                ${idsValue !== debouncedIdsValue ? 'bg-yellow-50' : ''}`}
              />
            )}
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



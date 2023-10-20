import {
    NextResponse
  } from 'next/server'
  
  import {
    Client
  } from "@notionhq/client";
  
  const NOTION_ID = 'id';
  const DGMDCC_ID = 'id';
  
  const NOTION_URL = 'url';
  const DGMDCC_URL = 'url';
  
  const NOTION_RESULTS = 'results';
  const NOTION_PROPERTIES = 'properties';
  
  const NOTION_DATA_TYPE = 'type';
  const NOTION_DATA_TYPE_NUMBER = 'number';
  const NOTION_DATA_TYPE_SELECT = 'select';
  const NOTION_DATA_TYPE_MULTI_SELECT = 'multi_select';
  const NOTION_DATA_TYPE_FILES = 'files';
  const NOTION_DATA_TYPE_TITLE = 'title';
  const NOTION_DATA_TYPE_RICH_TEXT = 'rich_text';
  const NOTION_DATA_TYPE_RELATION = 'relation';
  
  const NOTION_KEY_NAME = 'name';
  const NOTION_KEY_FILE = 'file';
  const NOTION_KEY_URL = 'url';
  const NOTION_KEY_PLAIN_TEXT = 'plain_text';
  const NOTION_KEY_DATABASE_ID = 'database_id';
  const NOTION_KEY_ID = 'id';
  
  const NOTION_KEY_RELATION = 'relation';
  
  const QUERY_PREFIX = 'QUERY_PREFIX';
  const QUERY_KEY = 'QUERY_KEY';
  const QUERY_PROPERTIES = 'QUERY_PROPERTIES';
  
  const NOTION_RESULT_PRIMARY_DATABASE = 'NOTION_RESULT_PRIMARY_DATABASE';
  const NOTION_RESULT_RELATION_DATABASES = 'NOTION_RESULT_RELATION_DATABASES';
  

  export async function GET( req: Request, res: Response ) {
  
    // connect to NOTION
    const notionSecret = SECRET_ID;
    const nClient = new Client({ 
      auth: notionSecret
    });
  
    const pageId = '87d1d139-0f1a-4739-a0de-ecf275928d59';
    const response = await nClient.pages.update({
      page_id: pageId,
  
      properties: {
        'name': {
          title: [{
            text: {
              content: 'soy protein'
            }
          }]
        }
      }
    });
    console.log(response);
  
  
    return NextResponse.json( { hello: 'world' } );
  
  };

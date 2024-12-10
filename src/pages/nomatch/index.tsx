import React from 'react';
import { mdiEmoticonSadOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

const NoMatchPage = () => (
  <>
    <title>No Route Found | Shoko</title>
    <div className="flex size-full flex-col items-center justify-center gap-y-4">
      <Icon path={mdiEmoticonSadOutline} size={4} />
      <p>No Route Found!</p>
      <p>Check the URL and try again.</p>
    </div>
  </>
);

export default NoMatchPage;

import React from 'react';
import { mdiEmoticonSadOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

const NoMatchPage = () => (
  <div className="items-center justify-center flex flex-col h-full w-full gap-y-4">
    <Icon path={mdiEmoticonSadOutline} size={4} />
    <p>No Route Found!</p>
    <p>Check the URL and try again.</p>
  </div>
);

export default NoMatchPage;

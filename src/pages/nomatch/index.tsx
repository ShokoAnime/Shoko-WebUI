import React from 'react';
import { mdiEmoticonSadOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

const NoMatchPage = () => (
  <div className="items-center justify-center flex h-full">
    <Icon path={mdiEmoticonSadOutline} size={4} />
    <p>No route found</p>
  </div>
);

export default NoMatchPage;

import React from 'react';
import { useParams } from 'react-router';

import DynamicConfiguration from '@/components/Configuration/DynamicConfiguration';

function DynamicSettings(): React.JSX.Element {
  const { configGuid } = useParams();
  return <DynamicConfiguration configGuid={configGuid} setTitle />;
}

export default DynamicSettings;

import React from 'react';
import { useParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import { usePluginPagesForPluginQuery } from '@/core/react-query/plugin/queries';

const PluginPageEmbed = () => {
  const { pageId = '', pluginId = '' } = useParams();

  const { data: pages, isPending } = usePluginPagesForPluginQuery(pluginId, pluginId !== '');

  const page = pages?.find(pgEntry => pgEntry.ID === pageId);

  if (isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={5} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        Plugin page not found.
      </div>
    );
  }

  return (
    <div className="flex w-full grow rounded-lg">
      <iframe
        src={page.Url}
        title={page.Name}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
        className="w-full h-full border-none rounded-lg"
      />
    </div>
  );
};

export default PluginPageEmbed;

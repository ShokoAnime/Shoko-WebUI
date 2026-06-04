import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { mdiMagnify } from '@mdi/js';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import CatalogPanel from '@/components/Settings/PluginManagement/CatalogPanel';
import InstalledPluginsPanel from '@/components/Settings/PluginManagement/InstalledPluginsPanel';
import PluginUpdatesPanel from '@/components/Settings/PluginManagement/PluginUpdatesPanel';
import RepositoryPanel from '@/components/Settings/PluginManagement/RepositoryPanel';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const sections = [
  { label: 'Installed', value: 'installed' },
  { label: 'Browse', value: 'browse' },
  { label: 'Updates', value: 'updates' },
  { label: 'Repositories', value: 'repositories' },
] as const;

const defaultSection = 'installed';

const isValidSection = (section?: string): section is typeof sections[number]['value'] =>
  !!section && sections.some(item => item.value === section);

const PluginManagementSettings = () => {
  const navigate = useNavigateVoid();
  const { section } = useParams();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 300);
  const trimmedQuery = debouncedQuery.trim();
  const selectedSection = isValidSection(section) ? section : defaultSection;

  let content = (
    <>
      {selectedSection === 'repositories' && <RepositoryPanel query={trimmedQuery} />}
      {selectedSection === 'browse' && <CatalogPanel query={trimmedQuery} />}
      {selectedSection === 'installed' && <InstalledPluginsPanel query={trimmedQuery} />}
      {selectedSection === 'updates' && <PluginUpdatesPanel query={trimmedQuery} />}
    </>
  );

  if (!isValidSection(section)) {
    content = <Navigate replace to={`/webui/settings/plugins/${defaultSection}`} />;
  }

  return (
    <>
      <title>Settings &gt; Plugin Management | Shoko</title>
      <div className="flex flex-col gap-y-1 sm:gap-y-2">
        <div className="text-xl font-semibold">Plugin Management</div>
        <div className="max-w-3xl">
          Manage plugin repositories, browse plugin packages, review installed plugins, and manually apply updates.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <MultiStateButton
        activeState={selectedSection}
        onStateChange={state => navigate(`/webui/settings/plugins/${state}`)}
        states={sections}
      />

      <Input
        id="plugin-search"
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Search plugins and repositories"
        startIcon={mdiMagnify}
      />

      {content}
    </>
  );
};

export default PluginManagementSettings;

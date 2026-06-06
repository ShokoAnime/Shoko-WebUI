import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { mdiMagnify } from '@mdi/js';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import BrowseSection from '@/components/Settings/PluginManagement/Sections/BrowseSection';
import InstalledSection from '@/components/Settings/PluginManagement/Sections/InstalledSection';
import RepositoriesSection from '@/components/Settings/PluginManagement/Sections/RepositoriesSection';
import UpdatesSection from '@/components/Settings/PluginManagement/Sections/UpdatesSection';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const sections = [
  { label: 'Installed', value: 'installed' },
  { label: 'Browse', value: 'browse' },
  { label: 'Updates', value: 'updates' },
  { label: 'Repositories', value: 'repositories' },
] as const;

const isValidSection = (section?: string): section is typeof sections[number]['value'] =>
  !!section && sections.some(item => item.value === section);

const PluginManagementSettings = () => {
  const navigate = useNavigateVoid();
  const { section } = useParams();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query?.toLowerCase().trim(), 300);

  if (!isValidSection(section)) {
    return <Navigate replace to="../installed" />;
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
        activeState={section}
        onStateChange={state => navigate(`../${state}`)}
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

      {section === 'installed' && <InstalledSection query={debouncedQuery} />}
      {section === 'browse' && <BrowseSection query={debouncedQuery} />}
      {section === 'updates' && <UpdatesSection query={debouncedQuery} />}
      {section === 'repositories' && <RepositoriesSection query={debouncedQuery} />}
    </>
  );
};

export default PluginManagementSettings;

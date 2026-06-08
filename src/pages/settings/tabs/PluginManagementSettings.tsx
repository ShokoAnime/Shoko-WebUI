import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { mdiCogOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import PluginUpdateSettingsModal from '@/components/Settings/PluginManagement/Dialogs/PluginUpdateSettingsModal';
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
  const [showSettingsModal, toggleSettingsModal] = useToggle(false);

  if (!isValidSection(section)) {
    return <Navigate replace to="../installed" />;
  }

  return (
    <>
      <title>Settings &gt; Plugin Management | Shoko</title>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Plugin Management</div>
          <Button onClick={toggleSettingsModal} tooltip="Settings">
            <Icon className="text-panel-icon-action" path={mdiCogOutline} size={1} />
          </Button>
        </div>
        <div>
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

      <PluginUpdateSettingsModal show={showSettingsModal} onClose={toggleSettingsModal} />
    </>
  );
};

export default PluginManagementSettings;

import { useState } from 'react';
import { mdiMagnify } from '@mdi/js';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import { pluginManagementSections } from '@/components/Settings/PluginManagement/PluginManagementSections.utils';
import BrowseSection from '@/components/Settings/PluginManagement/Sections/BrowseSection';
import InstalledSection from '@/components/Settings/PluginManagement/Sections/InstalledSection';
import RepositoriesSection from '@/components/Settings/PluginManagement/Sections/RepositoriesSection';
import UpdatesSection from '@/components/Settings/PluginManagement/Sections/UpdatesSection';

import type { PluginManagementSectionType } from '@/components/Settings/PluginManagement/PluginManagementSections.utils';

type Props = {
  onSectionChange: (section: PluginManagementSectionType) => void;
  section: PluginManagementSectionType;
};

// The whole of plugin management below its header. Works without a login while the server is not started.
const PluginManagementSections = ({ onSectionChange, section }: Props) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query?.toLowerCase().trim(), 300);

  return (
    <>
      <MultiStateButton
        activeState={section}
        onStateChange={state => onSectionChange(state as PluginManagementSectionType)}
        states={pluginManagementSections}
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

export default PluginManagementSections;

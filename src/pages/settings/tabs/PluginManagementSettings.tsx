import { Navigate, useParams } from 'react-router';

import PluginManagementSections from '@/components/Settings/PluginManagement/PluginManagementSections';
import { isPluginManagementSection } from '@/components/Settings/PluginManagement/PluginManagementSections.utils';
import PluginUpdateSettingsButton from '@/components/Settings/PluginManagement/PluginUpdateSettingsButton';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const PluginManagementSettings = () => {
  const navigate = useNavigateVoid();
  const { section } = useParams();

  if (!isPluginManagementSection(section)) {
    return <Navigate replace to="../installed" />;
  }

  return (
    <>
      <SettingsHeader title="Plugin Management" actions={<PluginUpdateSettingsButton />}>
        Manage plugin repositories, browse plugin packages, review installed plugins, and manually apply updates.
      </SettingsHeader>

      <div className="border-b border-panel-border" />

      <PluginManagementSections section={section} onSectionChange={state => navigate(`../${state}`)} />
    </>
  );
};

export default PluginManagementSettings;

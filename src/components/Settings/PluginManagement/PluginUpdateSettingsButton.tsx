import { mdiCogOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import PluginUpdateSettingsModal from '@/components/Settings/PluginManagement/Dialogs/PluginUpdateSettingsModal';

const PluginUpdateSettingsButton = () => {
  const [showSettingsModal, toggleSettingsModal] = useToggle(false);

  return (
    <>
      <Button onClick={toggleSettingsModal} tooltip="Settings">
        <Icon className="text-panel-icon-action" path={mdiCogOutline} size={1} />
      </Button>
      <PluginUpdateSettingsModal show={showSettingsModal} onClose={toggleSettingsModal} />
    </>
  );
};

export default PluginUpdateSettingsButton;

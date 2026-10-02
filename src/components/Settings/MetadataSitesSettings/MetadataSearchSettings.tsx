import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';

import type { SettingsContextType } from '@/core/types/context';

type Props = Pick<SettingsContextType, 'newSettings' | 'setNewSettings'>;

/** The options of the linking page's search, which serve every source. */
const MetadataSearchSettings = ({ newSettings, setNewSettings }: Props) => {
  const handleIncludeRestrictedChange = (value: boolean) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.metadata.includeRestricted = value;
    }));
  };

  return (
    <Checkbox
      justify
      label="Include Restricted in Search"
      id="metadata-include-restricted"
      isChecked={newSettings.WebUI_Settings.collection.metadata.includeRestricted}
      onChange={event => handleIncludeRestrictedChange(event.target.checked)}
    />
  );
};

export default MetadataSearchSettings;

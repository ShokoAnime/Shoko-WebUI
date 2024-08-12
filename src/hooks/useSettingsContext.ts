import { useOutletContext } from 'react-router-dom';

import type { PluginRenamerSettingsType, SettingsType } from '@/core/types/api/settings';

type ContextType = {
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string | string[] | boolean | PluginRenamerSettingsType) => void;
};

const useSettingsContext = () => useOutletContext<ContextType>();

export default useSettingsContext;

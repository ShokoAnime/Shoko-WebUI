import { useOutletContext } from 'react-router-dom';

import type { SettingsType } from '@/core/types/api/settings';

type ContextType = {
  fetching: boolean;
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string | string[] | boolean) => void;
  saveSettings: () => Promise<void>;
};

const useFirstRunSettingsContext = () => useOutletContext<ContextType>();

export default useFirstRunSettingsContext;

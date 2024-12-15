import { useOutletContext } from 'react-router';

import type { SettingsContextType } from '@/core/types/context';

type ContextType = SettingsContextType & {
  fetching: boolean;
  updateSetting: (type: string, key: string, value: string | string[] | boolean) => void;
  saveSettings: () => Promise<void>;
};

const useFirstRunSettingsContext = () => useOutletContext<ContextType>();

export default useFirstRunSettingsContext;

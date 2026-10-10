import { useOutletContext } from 'react-router';

import type { SettingsPageContextType } from '@/core/types/context';

type ContextType = SettingsPageContextType & {
  fetching: boolean;
  saveSettings: () => Promise<void>;
};

const useFirstRunSettingsContext = () => useOutletContext<ContextType>();

export default useFirstRunSettingsContext;

import { useOutletContext } from 'react-router';

import type { SettingsContextType } from '@/core/types/context';

type ContextType = SettingsContextType & {
  fetching: boolean;
  saveSettings: () => Promise<void>;
};

const useFirstRunSettingsContext = () => useOutletContext<ContextType>();

export default useFirstRunSettingsContext;

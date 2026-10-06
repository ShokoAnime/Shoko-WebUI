import { useOutletContext } from 'react-router';

import type { SettingsPageContextType } from '@/core/types/context';

const useSettingsContext = () => useOutletContext<SettingsPageContextType>();

export default useSettingsContext;

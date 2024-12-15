import { useOutletContext } from 'react-router';

import type { SettingsContextType } from '@/core/types/context';

const useSettingsContext = () => useOutletContext<SettingsContextType>();

export default useSettingsContext;

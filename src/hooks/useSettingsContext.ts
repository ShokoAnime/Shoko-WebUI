import { useOutletContext } from 'react-router';

import type { AiringScheduleDraftContextType, SettingsPageContextType } from '@/core/types/context';

const useSettingsContext = () => useOutletContext<AiringScheduleDraftContextType & SettingsPageContextType>();

export default useSettingsContext;

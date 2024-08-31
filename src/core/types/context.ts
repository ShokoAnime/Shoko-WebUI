import type { PluginRenamerSettingsType, SettingsType } from '@/core/types/api/settings';

export type SettingsContextType = {
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string | string[] | boolean | PluginRenamerSettingsType) => void;
};

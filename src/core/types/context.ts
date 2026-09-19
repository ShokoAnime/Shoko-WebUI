import type { PluginRenamerSettingsType, SettingsAnidbMyListType, SettingsType } from '@/core/types/api/settings';

export type SettingValueType =
  | string
  | string[]
  | number
  | boolean
  | SettingsAnidbMyListType
  | PluginRenamerSettingsType
  | undefined;

export type SettingsContextType = {
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: SettingValueType) => void;
};

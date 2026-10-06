import type { AiringScheduleDraftType } from '@/core/react-query/airing-schedule/draft';
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

/** The context of the settings page: the settings draft, plus the airing schedule draft, both sent on save. */
export type SettingsPageContextType = SettingsContextType & {
  airingScheduleDraft: AiringScheduleDraftType;
  setAiringScheduleDraft: (draft: AiringScheduleDraftType) => void;
};

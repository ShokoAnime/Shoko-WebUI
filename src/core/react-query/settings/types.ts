import type { SettingsType } from '@/core/types/api/settings';

export type SettingsPatchRequestType = {
  oldSettings: SettingsType;
  newSettings: SettingsType;
  skipValidation?: boolean;
};

export type AniDBLoginRequestType = {
  Username: string;
  Password: string;
};
